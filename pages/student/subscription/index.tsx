import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import React, {useEffect, useState } from 'react'
import * as Yup from 'yup'
import {ErrorMessage, Field, FieldArray, Form, Formik} from 'formik'
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/core";
import MaskedInput from 'react-input-mask';
import DatePicker, { registerLocale }  from "react-datepicker";
import ptBR from 'date-fns/locale/pt-BR';
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import style from '../../../styles/subscription.module.css';
import { APIRoutes } from '../../../utils/api.routes';
import API from '../../../lib/api.service';
import Permission from '../../../lib/permission.service';
import { UserType } from '../../../enum/type-user.enum';
import StudentBase from '../../../components/student/student-base';
import { APIResponse } from '../../../models/api-response';
import { User } from '../../../models/user';
import { MaskHelper } from '../../../helpers/mask-helper';
import SelectiveProcessUtil from '../../../lib/selectiveprocess.util';
import { DocumentValidateHelper } from '../../../helpers/document-validate-helper';
import { MathHelper } from '../../../helpers/math-helper';
import { PostalCodeField } from '../../../components/postal-code-field';
import WarningDialog from '../../../components/warning-dialog';
import { FileHelper } from '../../../helpers/file-helper';
import ConfirmDialog from '../../../components/confirm-dialog';
import { Subscription } from '../../../models/subscription/subscription';
import { SelectiveProcess } from '../../../models/subscription-process/selective-process';
import { SubscriptionTypeFile } from '../../../models/subscription/subscription-type-file.enum';
import { ProcessStepsTypes } from '../../../models/subscription-process/process-steps-types.enum';
import { SubscriptionStatus } from '../../../models/subscription/subscription-resource.enum';
registerLocale('pt-BR', ptBR);

export default function SubscriptionLayout(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const api = API();
    const processUtil = SelectiveProcessUtil();
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState<Subscription>();
    const [currentSubscription, setCurrentSubscription] = useState<Subscription>();
    const [currentUser, setCurrentUser] = useState<User>(null);
    const [selectiveProcessOpen, setSelectiveProcessOpen] = useState<boolean>(false);
    const [selectiveProcess, setSelectiveProcess] = useState<SelectiveProcess>(null);
    const [currentStage, setCurrentStage] = useState(1);
    const [stageOneValues, setStageOneValues] = useState(null);
    const [stageTwoValues, setStageTwoValues] = useState(null);
    const [stageThreeValues, setStageThreeValues] = useState(null);
    const [stageFourValues, setStageFourValues] = useState(null);
    const [subCategoriesFiles, setSubCategoriesFiles] = useState<any>([]);
    const [formFiles, setFormFiles] = useState<any>([]);
    const [baremaCategories, setBaremaCategories] = useState<any>(null);
    const [documentFile, setDocumentFile] = useState<FileList>();
    const [graduationProofFile, setGraduationProofFile] = useState<FileList>();
    const [invalidDocumentFile, setInvalidDocumentFile] = useState<any>(false);
    const [invalidGraduationProofFile, setInvalidGraduationProofFile] = useState<any>(false);
    const [countFiles, setCountFiles] = useState<number>(0);
    const [percentage, setPercentage] = useState<number>(0);
    const [openFileModal, setOpenFileModal] = useState<boolean>(false);
    const [openConfirmationModal, setOpenConfirmationModal] = useState<boolean>(false);
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const specialTreatmentTypes = [
        { name: "Prova em Braille", value: 'prova_braille' },
        { name: "Auxílio de Leitor/Ledor", value: 'auxilio_leitor' },
        { name: "Intérprete de Libras", value: 'interprete_libras' },
        { name: "Sala de Mais Acesso", value: 'sala_mais_acesso' },
        { name: "Auxílio para Transcrição", value: 'auxilio_transcricao' },
        { name: "Mesa e Cadeiras sem Braço", value : 'mesa_sem_braco' },
    ];

    function closeModal(type) {
        switch (type) {
            case "file":
                setOpenFileModal(false);
                break;
            case "confirmation":
                setOpenConfirmationModal(false);
                break;
        }
    }

    const verifyFileSize = (file)  => {
        const check = FileHelper.checkFileSize(file);
        setOpenFileModal(!check)
        return check
    }

    const getRouteFile = (type) => {
        switch (type) {
            case SubscriptionTypeFile.BAREMA:
                return APIRoutes.FILE_BAREMA_SUBSCRIPTION;
            case SubscriptionTypeFile.DOCUMENT:
            case SubscriptionTypeFile.GRADUATION:
                return APIRoutes.FILE_SUBSCRIPTION;
            case SubscriptionTypeFile.FORM:
                return APIRoutes.FILE_FORM_SUBSCRIPTION;
            default:
                return '';
        }
    }

    const saveSubscription = async (values: Subscription) => {
        try {
            if(subscription){
                values = {...values, id: subscription.id};
            }
            const result = await api.post(APIRoutes.SUBSCRIPTION, values);
            if(result){
                setSubscription(result.result)
                return result.result;
            }
        } catch (error) {
            console.error(error);
        }
    };

    const saveFileSubscription = async (values, files, type, roundWeight) => {
        try {
            const route = getRouteFile(type);
            await api.postFile(route, values, files);
            const fileLength = files.length ? files.length : 1;
            setPercentage((prev) => (prev + (roundWeight * fileLength)) > 100 ? 100 : (prev + (roundWeight * fileLength)));
        } catch (error) {
            console.error(error);
        }
    };

    const handleFile = async (subcategoryUuid, position, file) => {
        if(!verifyFileSize(file)) {
            return;
        }

        const subcategoryFound = subCategoriesFiles.find((subcategory) => subcategory.uuid === subcategoryUuid);

        if(!subcategoryFound){
            setCountFiles((prev) => prev + 1);
            subCategoriesFiles.push({uuid: subcategoryUuid, files: [{position: position, file: file}]});
            setSubCategoriesFiles(subCategoriesFiles)
            return;
        }

        let newPosition = true;
        const subCategoriesFilesUpdated = await subCategoriesFiles.map((subcategory) => {
            if(subcategory.uuid !== subcategoryUuid){
                return subcategory;
            }
            subcategory.files.forEach((element) => {
                if(element.position === position){
                    element.file = file;
                    newPosition = false;
                }
            });

            if(newPosition){
                setCountFiles((prev) => prev + 1);
                subcategory.files.push({position: position, file: file})
            }
            
            return subcategory;
        });

        setSubCategoriesFiles(subCategoriesFilesUpdated)
    }

    const handleFileForm = async (name, file) => {
        if(!verifyFileSize(file)) {
            return;
        }

        const formFileFound = formFiles.find((formFile) => formFile.name === name);

        if(!formFileFound){
            setCountFiles((prev) => prev + 1);
            formFiles.push({name: name, file: file});
            setFormFiles(formFiles)
            return;
        }

        const formFilesUpdated = await formFiles.map((formFile) => {            
            if(formFile.name !== name){
                return formFile;
            }
            formFile.file = file;
            return formFile;
        });

        setFormFiles(formFilesUpdated)
    }

    const getFileNameForm = (name) => {
        const formFileFound = formFiles.find((formFile) => formFile.name === name);
        if(formFileFound){
            const file = formFileFound.file;
            return file ? file[0]?.name : 'Nenhum arquivo selecionado';
        }

        return 'Nenhum arquivo selecionado';
    }

    const getFileName = (subcategoryUuid, position) => {
        const subCategoriesFile = subCategoriesFiles.find((subcategory) => subcategory.uuid == subcategoryUuid);
        if(subCategoriesFile){
            const file = subCategoriesFile.files.find((file) => file.position === position);
            return file ? file.file[0]?.name : 'Nenhum arquivo selecionado';
        }

        return 'Nenhum arquivo selecionado';
    }

    const removeFile = async (subcategoryUuid, position) => {
        const subCategoriesFilesUpdated = subCategoriesFiles.map((subcategory) => {
            if(subcategory.uuid !== subcategoryUuid){
                return subcategory;
            }

            subcategory.files = subcategory.files.filter(file => file.position !== position)

            subcategory.files.forEach((element, index) => {
                element.position = index;
            });
            return subcategory;
        });        
        setCountFiles((prev) => prev - 1);
        setSubCategoriesFiles(subCategoriesFilesUpdated)
    }
    
    const buildForm = async () => {   
        const subscription: Subscription = {    
            name: stageOneValues.name,
            document: stageOneValues.document,
            identityDocument: stageOneValues.identityDocument,
            issuingAgency: stageOneValues.issuingAgency,
            issuanceDate: stageOneValues.issuanceDate,
            birthdate: stageOneValues.birthdate,
            postalCode: stageOneValues.postalCode,
            street: stageOneValues.street,
            houseNumber: stageOneValues.houseNumber,
            complement: stageOneValues.complement,
            district: stageOneValues.district,
            city: stageOneValues.city,
            state: stageOneValues.state,
            phoneNumber: stageOneValues.phoneNumber,
            alternativePhoneNumber: stageOneValues.alternativePhoneNumber,

            graduation: stageTwoValues.graduation,
            graduationInstitution: stageTwoValues.graduationInstitution,
            postgraduateLatoSensu: stageTwoValues.postgraduateLatoSensu,
            postgraduateLatoSensuInstitution: stageTwoValues.postgraduateLatoSensuInstitution,
            postgraduateStrictoSensu: stageTwoValues.postgraduateStrictoSensu,
            postgraduateStrictoSensuInstitution: stageTwoValues.postgraduateStrictoSensuInstitution,
        
            profession: stageThreeValues.profession,
            company: stageThreeValues.company,
            postalCodeCompany: stageThreeValues.postalCode,
            streetCompany: stageThreeValues.streetCompany,
            houseNumberCompany: stageThreeValues.houseNumberCompany,
            complementCompany: stageThreeValues.complementCompany,
            districtCompany: stageThreeValues.districtCompany,
            cityCompany: stageThreeValues.cityCompany,
            stateCompany: stageThreeValues.stateCompany,
            phoneNumberCompany: stageThreeValues.phoneNumberCompany,
            workShift: stageThreeValues.workShift,
            workRegime: stageThreeValues.workRegime,

            disability: stageFourValues.disability,
            disabilityType: stageFourValues.disabilityType,
            specialTreatmentTypes: stageFourValues.specialTreatmentTypes,
            reservedPlace: stageFourValues.reservedPlace !== 'ampla_concorrencia' ? stageFourValues.reservedPlace : null,  
            selectiveProcessID: currentSubscription ? currentSubscription.selectiveProcessID : selectiveProcess.id,
        }

        return subscription;
    }

    const buildArrayFiles = async (files) => {
        const arrayFiles = [];
        for (let j = 0; j < files.length; j++){
            const file = files[j];
            arrayFiles.push(file.file[0])
        }
        return arrayFiles;
    }

    const processFormFiles = async (subscriptionId, roundWeight) => {
        const arrayFormFiles = []

        for (let i = 0; i < formFiles.length; i++){
            const formFile = formFiles[i];
            const file = formFile.file;            
            arrayFormFiles.push({subscriptionID: subscriptionId, name: formFile.name, files: [file[0]], type: SubscriptionTypeFile.FORM});
        }

        for (let i = 0; i < arrayFormFiles.length; i++){
            const form = arrayFormFiles[i];
            for(let j = 0; j < form.files.length; j++) {
                const _file = form.files[j];
                await saveFileSubscription({subscriptionID:form.subscriptionID, name: form.name}, [_file], SubscriptionTypeFile.FORM, roundWeight);
            }
        }
    }

    const processDocumentFiles = async (subscriptionId, roundWeight) => {
        const arrayFiles = [documentFile[0]];

        const values = {type: SubscriptionTypeFile.DOCUMENT, subscriptionID: subscriptionId};

        await saveFileSubscription(values, arrayFiles, SubscriptionTypeFile.DOCUMENT, roundWeight);
    }

    const processGraduationFile = async (subscriptionId, roundWeight) => {
        const arrayFiles = [graduationProofFile[0]];
        const values = {type: SubscriptionTypeFile.GRADUATION, subscriptionID: subscriptionId};

        await saveFileSubscription(values, arrayFiles, SubscriptionTypeFile.GRADUATION, roundWeight);
    }

    const processFiles = async (subscriptionId, roundWeight) => {
        const arraySubcategories = []

        for (let i = 0; i < subCategoriesFiles.length; i++){
            const subcategoryFile = subCategoriesFiles[i];
            const files = subcategoryFile.files;            
            const arrayFiles = await buildArrayFiles(files);
            arraySubcategories.push({subcategoryID: subcategoryFile.uuid, subscriptionID: subscriptionId, files: arrayFiles})
        }

        for (let i = 0; i < arraySubcategories.length; i++){
            const subcategory = arraySubcategories[i];
            for(let j = 0; j < subcategory.files.length; j++) {
                const _file = subcategory.files[j];
                await saveFileSubscription({subcategoryID: subcategory.subcategoryID, subscriptionID: subcategory.subscriptionID}, [_file], SubscriptionTypeFile.BAREMA, roundWeight);

            }
        }
    }

    const processSubscription = async () => {
        try {
            setCurrentStage(currentStage + 1);   
            const weight = 90 / countFiles;
            const roundWeight = MathHelper.roundNumber(weight, 2);
            const subscription: Subscription = await buildForm();
            const result = await saveSubscription(subscription);
            setPercentage(10);
            await processFiles(result.id, roundWeight);
            await processDocumentFiles(result.id, roundWeight);
            await processGraduationFile(result.id, roundWeight);   
            await processFormFiles(result.id, roundWeight);
            setCurrentStage(currentStage + 2);    
        } catch (e) {
            setCurrentStage(5);     
        }
    }
    
    const handleSubmit = async (values:any) => {
        if(currentStage === 1){
            setStageOneValues(values);
            setCurrentStage(currentStage + 1);
        }else if(currentStage === 2){
            setStageTwoValues(values);
            setCurrentStage(currentStage + 1);
        }else if(currentStage === 3){
            setStageThreeValues(values);
            setCurrentStage(currentStage + 1);
        }else if(currentStage === 4){
            setStageFourValues(values);
            setCurrentStage(currentStage + 1);
        }else if(currentStage === 5){   
            setInvalidDocumentFile(!documentFile)
            setInvalidGraduationProofFile(!graduationProofFile)
            if(!documentFile || !graduationProofFile) {
                return;
            }
            setOpenConfirmationModal(true);
        }
    }

    const back = async (values:any) => {    
        if(currentStage === 1){
            setStageOneValues(values);
        }else if(currentStage === 2){
            setStageTwoValues(values);
        }else if(currentStage === 3){
            setStageThreeValues(values);
        }else if(currentStage === 4){
            setStageFourValues(values);
        }
        if(currentStage !== 1){
            setCurrentStage(currentStage - 1);
        }
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    const confirmSubscription = async () => {
        closeModal('confirmation'); 
        await processSubscription();
    }

    const generateForm = () => {
        const values = {};
        baremaCategories?.forEach((baremaCategory, index) => {                                          
            baremaCategory.subcategories.forEach((subcategory, index) => {
                values[subcategory.uuid] = [''];
            })
        })
        return values;
    }

    const getTitle = () => {
        switch (currentStage) {
            case 1:
                return 'Dados Pessoais';
            case 2:
                return 'Dados Acadêmicos';
            case 3:
                return 'Dados Profissionais';
            case 4:
                return 'Vagas';
            case 5:
                return 'Arquivos';
        }
    }

    const loadForm = async (subscriptionData) => {   
        const stageOneData = {    
            name: subscriptionData.name,
            document: subscriptionData.document,
            identityDocument: subscriptionData.identityDocument,
            issuingAgency: subscriptionData.issuingAgency,
            issuanceDate: new Date(subscriptionData.issuanceDate),
            birthdate: new Date(subscriptionData.birthdate),
            postalCode: subscriptionData.postalCode,
            street: subscriptionData.street,
            houseNumber: subscriptionData.houseNumber,
            complement: subscriptionData.complement,
            district: subscriptionData.district,
            city: subscriptionData.city,
            state: subscriptionData.state,
            phoneNumber: subscriptionData.phoneNumber,
            alternativePhoneNumber: subscriptionData.alternativePhoneNumber,
        }

        const stageTwoData = { 
            graduation: subscriptionData.graduation,
            graduationInstitution: subscriptionData.graduationInstitution,
            postgraduateLatoSensu: subscriptionData.postgraduateLatoSensu,
            postgraduateLatoSensuInstitution: subscriptionData.postgraduateLatoSensuInstitution,
            postgraduateStrictoSensu: subscriptionData.postgraduateStrictoSensu,
            postgraduateStrictoSensuInstitution: subscriptionData.postgraduateStrictoSensuInstitution,
        }

        const stageThreeData = {         
            profession: subscriptionData.profession,
            company: subscriptionData.company,
            postalCode: subscriptionData.postalCode,
            streetCompany: subscriptionData.streetCompany,
            houseNumberCompany: subscriptionData.houseNumberCompany,
            complementCompany: subscriptionData.complementCompany,
            districtCompany: subscriptionData.districtCompany,
            cityCompany: subscriptionData.cityCompany,
            stateCompany: subscriptionData.stateCompany,
            phoneNumberCompany: subscriptionData.phoneNumberCompany,
            workShift: subscriptionData.workShift,
            workRegime: subscriptionData.workRegime,
        }

        const stageFourData = { 
            disability: subscriptionData.disability,
            disabilityType: subscriptionData.disabilityType,
            specialTreatmentTypes: subscriptionData.specialTreatmentTypes,
            reservedPlace: !!subscriptionData.reservedPlace ? subscriptionData.reservedPlace : 'ampla_concorrencia',  
            subscriptionDate: new Date(subscriptionData.subscriptionDate),
        }

        setStageOneValues(stageOneData);
        setStageTwoValues(stageTwoData);
        setStageThreeValues(stageThreeData);
        setStageFourValues(stageFourData);
    }
    
    const getSubcategoryName = (id) => {
        const categories = selectiveProcess.baremaCategories;
        for(let category of categories){
            for(let subcategory of category.subcategories){
                if(subcategory.uuid === id){
                    return subcategory.name;  
                }          
            } 
        }
    }

    useEffect(() => {   
        const loadData = async () => {
            const resultProcess: APIResponse = await api.get(APIRoutes.SELECTIVE_PROCESS, { 'open': "true" });
            
            if (resultProcess.result) {
                const selectiveProcess = resultProcess.result;  
                const currentStep = processUtil.getCurrentStep(selectiveProcess);
                setSelectiveProcess(selectiveProcess);

                if(currentStep.type === ProcessStepsTypes.INSCRICAO){
                    setSelectiveProcessOpen(true);
                    let cloneCategories = JSON.parse(JSON.stringify(selectiveProcess.baremaCategories))
                    cloneCategories.map((baremaCategory) => (
                        baremaCategory.subcategories.map((subcategory) => {
                            subcategory.files = [{position: 1, file: ''}]
                        })
                    ));
                    setBaremaCategories(cloneCategories);
                }
            } else {
                setSelectiveProcessOpen(false);
            }

            const resultSubscription: APIResponse = await api.get(APIRoutes.CURRENT_SUBSCRIPTION);
            if (resultSubscription?.result) {
                setCurrentSubscription(resultSubscription.result);
                await loadForm(resultSubscription.result);
            } else {
                const resultCurrentUser: APIResponse = await api.get(APIRoutes.CURRENT_USER);                
                const user: User = (resultCurrentUser as APIResponse)?.result;
                setCurrentUser(user);
            }
            
            setLoading(false);
        };      
        loadData();
    }, []);
   
    const override = css`  
        display: block;
        margin: 0 auto;
    `;

    if(loading){
        return (
            <StudentBase>
                <div>
                <ClipLoader color="#34A853" loading={loading} size={50} css={override}/>
                </div>
            </StudentBase>
            );
    }

    if(!selectiveProcessOpen && !currentSubscription){        
        return (
            <StudentBase>
                <div>
                    <p>Não existe Processo Seletivo com inscrições abertas.</p>
                </div>
            </StudentBase>
        );
    }

    return (    
        <StudentBase>
            {[1, 2, 3, 4, 5].includes(currentStage) &&
                <div className="row">   
                    <div className={`${style.title} col-md-6`}>       
                        {getTitle()}
                    </div>
                    <div className={`${style.steps} col-md-6`}>
                        <span className={`${style.step} ${currentStage === 1 ? style.stepActive : ''} ${currentStage > 1 ? style.stepFinish : ''}`}></span>
                        <span className={`${style.step} ${currentStage === 2 ? style.stepActive : ''} ${currentStage > 2 ? style.stepFinish : ''}`}></span>
                        <span className={`${style.step} ${currentStage === 3 ? style.stepActive : ''} ${currentStage > 3 ? style.stepFinish : ''}`}></span>
                        <span className={`${style.step} ${currentStage === 4 ? style.stepActive : ''} ${currentStage > 4 ? style.stepFinish : ''}`}></span>
                        <span className={`${style.step} ${currentStage === 5 ? style.stepActive : ''} ${currentStage > 5 ? style.stepFinish : ''}`}></span>
                    </div>
                </div>
            }
            {currentSubscription && <label className={currentSubscription.status === SubscriptionStatus.DEFERIDA ? style.badgeSuccess : style.badgeDanger}>{currentSubscription.status}</label>}
            {currentStage === 1 && 
                <>
               
                    <Formik
                        enableReinitialize
                        initialValues={
                            stageOneValues ? stageOneValues : {
                                name: currentUser ? currentUser.name : '',
                                birthdate: new Date(),
                                postalCode: '',
                                street: '',
                                houseNumber: '',
                                complement: '',
                                district: '',
                                city: '',
                                state: '',
                                alternativePhoneNumber: '',
                                phoneNumber: '',
                                document: '',
                                identityDocument: '',
                                issuingAgency: '',
                                issuanceDate: new Date(),
                            }
                        }
                        validationSchema={Yup.object().shape({
                            name: Yup.string().required('Preencha este campo.'),
                            birthdate: Yup.date().required('Preencha este campo.').nullable(),
                            postalCode: Yup.string().required('Preencha este campo.'),
                            street: Yup.string().required('Preencha este campo.'),
                            houseNumber: Yup.string().required('Preencha este campo.'),
                            district: Yup.string().required('Preencha este campo.'),
                            city: Yup.string().required('Preencha este campo.'),
                            state: Yup.string().required('Preencha este campo.'),
                            phoneNumber: Yup.string().required('Preencha este campo.'),
                            document: Yup.string().required('Preencha este campo.').min(14, 'CPF inválido.'),
                            identityDocument: Yup.string().required('Preencha este campo.'),
                            issuingAgency: Yup.string().required('Preencha este campo.'),
                            issuanceDate: Yup.date().required('Preencha este campo.').nullable(),
                        })}
                        onSubmit={handleSubmit}>
                        {(actions) => (
                        <Form>
                            <div className="row mt-5 justify-content-center">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">Nome<span>*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="name" 
                                            id="name" 
                                            value={actions.values.name}                
                                            onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                        <p className="input-error"><ErrorMessage name="name" className="input-error" /></p>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="mb-3">
                                        <label htmlFor="birthdate" className="form-label">Data de Nascimento<span>*</span></label>                 
                                        <DatePicker 
                                            locale="pt-BR" 
                                            selected={actions.values.birthdate} 
                                            dateFormat="dd/MM/yyyy" 
                                            onChange={(date) => { actions.setFieldValue('birthdate', date); }} 
                                            className="form-control" 
                                            customInput={
                                                <MaskedInput maskChar="" mask="99/99/9999"/>
                                            }
                                            disabled={!!currentSubscription}
                                        />                                        
                                        <p className="input-error"><ErrorMessage name="birthdate" className="input-error" /></p>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="mb-3">
                                        <label htmlFor="document" className="form-label">CPF<span>*</span></label>
                                        <Field 
                                            name="document"
                                            value={actions.values.document}                
                                            onChange={actions.handleChange} 
                                            validate={DocumentValidateHelper.documentValidate}>
                                                {({field}) => {
                                                    return (
                                                    <MaskedInput
                                                        {...field}        
                                                        disabled={!!currentSubscription}                             
                                                        className="form-control"
                                                        maskChar=""
                                                        mask={MaskHelper.makeMask(field.value, '', 'cpf')}
                                                    />
                                                    );
                                                }}
                                        </Field>               
                                        <p className="input-error"><ErrorMessage name="document" className="input-error" /></p>
                                    </div>                
                                </div> 
                                <div className="col-md-3">
                                    <div className="mb-3">
                                        <label htmlFor="identityDocument" className="form-label">Documento de Identidade<span>*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="identityDocument" 
                                            id="identityDocument" 
                                            value={actions.values.identityDocument}                
                                            onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                        <p className="input-error"><ErrorMessage name="identityDocument" className="input-error" /></p>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="mb-3">
                                        <label htmlFor="issuingAgency" className="form-label">Órgão Expedidor<span>*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="issuingAgency" 
                                            id="issuingAgency" 
                                            value={actions.values.issuingAgency}                
                                            onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                        <p className="input-error"><ErrorMessage name="issuingAgency" className="input-error" /></p>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="mb-3">
                                        <label htmlFor="issuanceDate" className="form-label">Data de Expedição<span>*</span></label>                                                   
                                        <DatePicker 
                                            locale="pt-BR" 
                                            selected={actions.values.issuanceDate} 
                                            dateFormat="dd/MM/yyyy" 
                                            onChange={(date) => { actions.setFieldValue('issuanceDate', date); }} 
                                            className="form-control" 
                                            disabled={!!currentSubscription} 
                                            customInput={
                                                <MaskedInput maskChar="" mask="99/99/9999"/>
                                            }
                                        />         
                                        <p className="input-error"><ErrorMessage name="issuanceDate" className="input-error" /></p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="phoneNumber" className="form-label">Telefone<span>*</span></label>
                                        <Field 
                                            name="phoneNumber"
                                            value={actions.values.phoneNumber}                
                                            onChange={actions.handleChange} >
                                                {({field}) => {
                                                    return (
                                                    <MaskedInput
                                                        {...field}     
                                                        disabled={!!currentSubscription}                                
                                                        className="form-control"
                                                        maskChar=""
                                                        mask={MaskHelper.makeMask(field.value, '', 'phone')}
                                                    />
                                                    );
                                                }}
                                        </Field>               
                                        <p className="input-error"><ErrorMessage name="phoneNumber" className="input-error" /></p>
                                    </div>                
                                </div>
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="alternativePhoneNumber" className="form-label">Telefone Alternativo</label>
                                        <Field 
                                            name="alternativePhoneNumber"
                                            value={actions.values.alternativePhoneNumber}                
                                            onChange={actions.handleChange} >
                                                {({field}) => {
                                                    return (
                                                    <MaskedInput
                                                        {...field}  
                                                        disabled={!!currentSubscription}                                   
                                                        className="form-control"
                                                        maskChar=""
                                                        mask={MaskHelper.makeMask(field.value, '', 'phone')}
                                                    />
                                                    );
                                                }}
                                        </Field>                  
                                        <p className="input-error"><ErrorMessage name="alternativePhoneNumber" className="input-error" /></p>
                                    </div>
                                </div>        
                                <div className="col-md-2">
                                    <div className="mb-3">
                                        <label htmlFor="postalCode" className="form-label">CEP<span>*</span></label>  
                                        <PostalCodeField 
                                            className="form-control" 
                                            name="postalCode" 
                                            disabled={!!currentSubscription} 
                                            value={actions.values.postalCode}                  
                                            onChange={actions.handleChange}
                                            type=""
                                        />          
                                        <p className="input-error"><ErrorMessage name="postalCode" className="input-error" /></p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="street" className="form-label">Endereço<span>*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="street" 
                                            id="street" 
                                            value={actions.values.street}                
                                            onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                        <p className="input-error"><ErrorMessage name="street" className="input-error" /></p>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="mb-3">
                                        <label htmlFor="houseNumber" className="form-label">Número<span>*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="houseNumber" 
                                            id="houseNumber" 
                                            value={actions.values.houseNumber}                
                                            onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                        <p className="input-error"><ErrorMessage name="houseNumber" className="input-error" /></p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="complement" className="form-label">Complemento</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="complement" 
                                            id="complement" 
                                            value={actions.values.complement}                
                                            onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                        <p className="input-error"><ErrorMessage name="complement" className="input-error" /></p>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="mb-3">
                                        <label htmlFor="district" className="form-label">Bairro<span>*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="district" 
                                            id="district" 
                                            value={actions.values.district}                
                                            onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                        <p className="input-error"><ErrorMessage name="district" className="input-error" /></p>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="mb-3">
                                        <label htmlFor="city" className="form-label">Cidade<span>*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="city" 
                                            id="city" 
                                            value={actions.values.city}                
                                            onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                        <p className="input-error"><ErrorMessage name="city" className="input-error" /></p>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="mb-3">
                                        <label htmlFor="state" className="form-label">Estado<span>*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="state" 
                                            id="state" 
                                            value={actions.values.state}                
                                            onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                        <p className="input-error"><ErrorMessage name="state" className="input-error" /></p>
                                    </div>
                                </div>
                            </div>
                            <br />
                            <div className="text-center">
                                <button type="submit" className="btn btn-primary" disabled={actions.isSubmitting}>Próximo</button>
                            </div>
                        </Form>
                        )}
                    </Formik>
                </>
            }
            {currentStage === 2 && 
                <Formik
                    enableReinitialize
                    initialValues={
                        stageTwoValues ? stageTwoValues : {
                            graduation: '',
                            graduationInstitution: '',
                            postgraduateLatoSensu: '',
                            postgraduateLatoSensuInstitution: '',
                            postgraduateStricto: '',
                            postgraduateStrictoSensuInstitution: '',
                        }
                    }
                    validationSchema={Yup.object().shape({
                        graduation: Yup.string().required('Preencha este campo.'),
                        graduationInstitution: Yup.string().required('Preencha este campo.'),
                    })}
                    onSubmit={handleSubmit}>
                    {(actions) => (
                    <Form>
                        <div className="row mt-5 justify-content-center">
                            <div className="col-md-5">
                                <div className="mb-3">
                                    <label htmlFor="graduation" className="form-label">Graduação<span>*</span></label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="graduation" 
                                        id="graduation" 
                                        value={actions.values.graduation}                
                                        onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                    <p className="input-error"><ErrorMessage name="graduation" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-md-7">
                                <div className="mb-3">
                                    <label htmlFor="graduationInstitution" className="form-label">Instituição de obtenção do título de Graduação<span>*</span></label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="graduationInstitution" 
                                        id="graduationInstitution" 
                                        value={actions.values.graduationInstitution}                
                                        onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                    <p className="input-error"><ErrorMessage name="graduationInstitution" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-md-5">
                                <div className="mb-3">
                                    <label htmlFor="postgraduateLatoSensu" className="form-label">Pós-graduação Lato Sensu</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="postgraduateLatoSensu" 
                                        id="postgraduateLatoSensu" 
                                        value={actions.values.postgraduateLatoSensu}                
                                        onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                    <p className="input-error"><ErrorMessage name="postgraduateLatoSensu" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-md-7">
                                <div className="mb-3">
                                    <label htmlFor="postgraduateLatoSensuInstitution" className="form-label">Instituição de obtenção do título de Pós-graduação Lato Sensu</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="postgraduateLatoSensuInstitution" 
                                        id="postgraduateLatoSensuInstitution" 
                                        value={actions.values.postgraduateLatoSensuInstitution}                
                                        onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                    <p className="input-error"><ErrorMessage name="postgraduateLatoSensuInstitution" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-md-5">
                                <div className="mb-3">
                                    <label htmlFor="postgraduateStrictoSensu" className="form-label">Pós-graduação Stricto Sensu</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="postgraduateStrictoSensu" 
                                        id="postgraduateStrictoSensu" 
                                        value={actions.values.postgraduateStrictoSensu}                
                                        onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                    <p className="input-error"><ErrorMessage name="postgraduateStrictoSensu" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-md-7">
                                <div className="mb-3">
                                    <label htmlFor="postgraduateStrictoSensuInstitution" className="form-label">Instituição de obtenção do título de Pós-graduação Stricto Sensu</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="postgraduateStrictoSensuInstitution" 
                                        id="postgraduateStrictoSensuInstitution" 
                                        value={actions.values.postgraduateStrictoSensuInstitution}                
                                        onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                    <p className="input-error"><ErrorMessage name="postgraduateStrictoSensuInstitution" className="input-error" /></p>
                                </div>
                            </div>                      
                        </div>
                        <br />
                        <div className="text-center">
                            <button onClick={() => back(actions.values)} className="btn btn-secondary m-1" disabled={actions.isSubmitting}>Anterior</button>
                            <button type="submit" className="btn btn-primary m-1" disabled={actions.isSubmitting}>Próximo</button>
                        </div>
                    </Form>
                    )}
                </Formik>
            }
            {currentStage === 3 && 
                <Formik
                    enableReinitialize
                    initialValues={
                        stageThreeValues ? stageThreeValues : {
                            profession: '',
                            company: '',
                            postalCode: '',
                            streetCompany: '',
                            houseNumberCompany: '',
                            complementCompany: '',
                            districtCompany: '',
                            cityCompany: '',
                            stateCompany: '',
                            workShift: '',
                            workRegime: '',
                        }
                    }
                    onSubmit={handleSubmit}>
                    {(actions) => (
                    <Form>
                        <div className="row mt-5 justify-content-center">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="profession" className="form-label">Atividade Profissional</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="profession" 
                                        id="profession" 
                                        value={actions.values.profession}                
                                        onChange={actions.handleChange} 
                                        disabled={!!currentSubscription} />                
                                    <p className="input-error"><ErrorMessage name="profession" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="company" className="form-label">Instituição ou Empresa de Atuação</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="company" 
                                        id="company" 
                                        value={actions.values.company}                
                                        onChange={actions.handleChange} 
                                        disabled={!!currentSubscription} />                
                                    <p className="input-error"><ErrorMessage name="company" className="input-error" /></p>
                                </div>
                            </div>
                        </div>
                        <div className="row justify-content-center">
                            <div className="col-md-2">
                                <div className="mb-3">
                                    <label htmlFor="postalCode" className="form-label">CEP</label>  
                                    <PostalCodeField 
                                        className="form-control" 
                                        name="postalCode" 
                                        disabled={!!currentSubscription} 
                                        value={actions.values.postalCode}                  
                                        onChange={actions.handleChange}
                                        type='Company'
                                    />          
                                    <p className="input-error"><ErrorMessage name="postalCode" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="mb-3">
                                    <label htmlFor="streetCompany" className="form-label">Endereço</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="streetCompany" 
                                        id="streetCompany" 
                                        value={actions.values.streetCompany}                
                                        onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                    <p className="input-error"><ErrorMessage name="streetCompany" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <div className="mb-3">
                                    <label htmlFor="houseNumberCompany" className="form-label">Número</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="houseNumberCompany" 
                                        id="houseNumberCompany" 
                                        value={actions.values.houseNumberCompany}                
                                        onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                    <p className="input-error"><ErrorMessage name="houseNumberCompany" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-md-5">
                                <div className="mb-3">
                                    <label htmlFor="complementCompany" className="form-label">Complemento</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="complementCompany" 
                                        id="complementCompany" 
                                        value={actions.values.complementCompany}                
                                        onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                    <p className="input-error"><ErrorMessage name="complementCompany" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="mb-3">
                                    <label htmlFor="districtCompany" className="form-label">Bairro</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="districtCompany" 
                                        id="districtCompany" 
                                        value={actions.values.districtCompany}                
                                        onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                    <p className="input-error"><ErrorMessage name="districtCompany" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="mb-3">
                                    <label htmlFor="cityCompany" className="form-label">Cidade</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="cityCompany" 
                                        id="cityCompany" 
                                        value={actions.values.cityCompany}                
                                        onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                    <p className="input-error"><ErrorMessage name="cityCompany" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="mb-3">
                                    <label htmlFor="stateCompany" className="form-label">Estado</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="stateCompany" 
                                        id="stateCompany" 
                                        value={actions.values.stateCompany}                
                                        onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                    <p className="input-error"><ErrorMessage name="stateCompany" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="workShift" className="form-label">Turno de Trabalho</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="workShift" 
                                        id="workShift" 
                                        value={actions.values.workShift}                
                                        onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                    <p className="input-error"><ErrorMessage name="workShift" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="workRegime" className="form-label">Carga Horária ou Regime de Trabalho</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="workRegime" 
                                        id="workRegime" 
                                        value={actions.values.workRegime}                
                                        onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                    <p className="input-error"><ErrorMessage name="workRegime" className="input-error" /></p>
                                </div>
                            </div>
                        </div>
                        <br />
                        <div className="text-center">
                            <button onClick={() => back(actions.values)} className="btn btn-secondary m-1" disabled={actions.isSubmitting}>Anterior</button>
                            <button type="submit" className="btn btn-primary m-1" disabled={actions.isSubmitting}>Próximo</button>
                        </div>
                    </Form>
                    )}
                </Formik>
            }
            {currentStage === 4 && 
                <Formik
                    enableReinitialize
                    initialValues={
                        stageFourValues ? stageFourValues : {
                            disability: '',
                            disabilityType: '',
                            specialTreatmentTypes: '',
                            reservedPlace: '',
                        }
                    }
                    validationSchema={Yup.object().shape({                        
                        disability: Yup.string().required('Preencha este campo.'),
                        reservedPlace: Yup.string().required('Preencha este campo.'),
                    })}
                    onSubmit={handleSubmit}>
                    {(actions) => (
                    <Form>
                        <div className="row mt-5 justify-content-center">
                            <div className="col-md-3">
                                <label htmlFor="disability" className="form-label">Portador de Deficiência<span>*</span></label>
                                <div role="group" aria-labelledby="my-radio-group"> 
                                    <div className={style.radioGroup}>
                                        <div className={style.radio}>
                                            <input type="radio" name="disability" value="1" onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} checked={actions.values.disability === "1"}/>
                                            <label>Sim</label>
                                        </div>  
                                        <div className={style.radio}>
                                            <input type="radio" name="disability" value="0" onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} checked={actions.values.disability === "0"} />
                                            <label>Não</label>                                  
                                        </div>
                                    </div>
                                    <p className="input-error"><ErrorMessage name="disability" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-md-5">
                                {actions.values.disability === '1' && 
                                    <div className="mb-3">
                                        <label htmlFor="disabilityType" className="form-label">Tipo de Deficiência</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="disabilityType" 
                                            id="disabilityType" 
                                            value={actions.values.disabilityType}                
                                            onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} />                
                                        <p className="input-error"><ErrorMessage name="disabilityType" className="input-error" /></p>
                                    </div>
                                }
                            </div>
                            <div className="col-md-4">
                                {actions.values.disability === '1' && 
                                    <div className="mb-3">
                                        <label htmlFor="type" className="form-label">Tipos de Atendimento Especial</label>
                                        <select 
                                            className="form-select form-control" 
                                            name="specialTreatmentTypes"
                                            id="specialTreatmentTypes"
                                            placeholder=""
                                            value={actions.values.specialTreatmentTypes}
                                            onChange={actions.handleChange} 
                                            disabled={!!currentSubscription}
                                            multiple
                                        >
                                            {specialTreatmentTypes.map((specialTreatmentType, index) => (
                                                <option value={specialTreatmentType.value} key={index}>{specialTreatmentType.name}</option>
                                            ))}
                                        </select>
                                        <p className="input-error"><ErrorMessage name="type" /></p>
                                    </div>
                                }
                            </div>
                            <div className="col-md-12">
                                <label htmlFor="reservedPlace" className="form-label">Concorrência às vagas destinadas para:<span>*</span></label>
                                <div role="group" aria-labelledby="my-radio-group"> 
                                    <div className={style.radioGroup}>
                                        <div className={style.radioReservedPlace}>
                                        <input type="radio" name="reservedPlace" value="ampla_concorrencia" onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} checked={actions.values.reservedPlace === 'ampla_concorrencia'}/>
                                        <label>Ampla concorrência</label>
                                        </div>  
                                    </div>
                                    {selectiveProcess.reservedPlaces.map((reservedPlace, index) => (
                                        <div className={style.radioGroup} key={index}>
                                            <div className={style.radioReservedPlace}>
                                            <input type="radio" name="reservedPlace" value={reservedPlace.uuid} onChange={actions.handleChange} 
                                            disabled={!!currentSubscription} checked={actions.values.reservedPlace === reservedPlace.uuid}/>
                                            <label>{reservedPlace.name}</label>
                                            </div>  
                                        </div>
                                    ))}
                                </div>
                                <p className="input-error"><ErrorMessage name="reservedPlace" className="input-error" /></p>
                            </div>
                        </div>
                        <br />
                        <div className="text-center">
                            <button onClick={() => back(actions.values)} className="btn btn-secondary m-1" disabled={actions.isSubmitting}>Anterior</button>
                            <button type="submit" className="btn btn-primary m-1" disabled={actions.isSubmitting}>Próximo</button>
                        </div>
                    </Form>
                    )}
                </Formik>
            }
            {currentStage === 5 && !currentSubscription &&
                <Formik
                    enableReinitialize
                    initialValues={generateForm()}      
                    onSubmit={handleSubmit}>
                    {(actions) => (
                    <Form>
                        <div className="row mt-5 justify-content-center">
                            <p className={style.warningFile}>*Os arquivos devem ter no máximo 4MB</p>
                            <div className={style.boxFiles}>
                                <label className={`mt-3 ${style.titleFileCategory}`}>Documentos Obrigatórios</label>
                                <div className="col-md-12">
                                    <div className="mb-3">                                    
                                        <div className="row">
                                            <label className="form-label">Documento pessoal com foto<span>*</span></label>
                                        </div>
                                        
                                        <div className="row">
                                            <label htmlFor="documentFile" className={`${style.fileButton} col-md-3`}>
                                                Escolher arquivo
                                            </label>
                                            <div className={`${style.fileName} col-md-9`}>
                                                {documentFile ? documentFile[0]?.name : 'Nenhum arquivo selecionado'}
                                            </div>
                                            <input 
                                                type="file"
                                                className="form-control"
                                                id="documentFile"
                                                name="documentFile"
                                                onChange={(event) => {
                                                    actions.handleChange(event);
                                                    const files = event.currentTarget.files;                                                   
                                                    if(!verifyFileSize(files)) {
                                                        return;
                                                    }
                                                    setCountFiles((prev) => !documentFile && files.length > 0 ? prev + 1 : (documentFile && files.length === 0 ? prev - 1 : prev));
                                                    setDocumentFile(files.length > 0 ? files : null);
                                                    setInvalidDocumentFile(files.length === 0);
                                                }}
                                                value={undefined}
                                                style={{display:'none'}}
                                            />
                                            <p className="input-error">
                                                <ErrorMessage name="documentFile" className="input-error"/>
                                                {invalidDocumentFile ? 'Preencha este campo.' : ''}
                                            </p>
                                        </div>                                    
                                    </div>
                                </div>                                                   
                                <div className="col-md-12">
                                    <div className="mb-3">
                                        <div className="row">
                                            <label className="form-label">Diploma da Graduação<span>*</span></label>
                                        </div>
                                        <div className="row">
                                            <label htmlFor="graduationProofFile" className={`${style.fileButton} col-md-3`}>
                                                Escolher arquivo
                                            </label>
                                            <div className={`${style.fileName} col-md-9`}>
                                                {graduationProofFile ? graduationProofFile[0]?.name : 'Nenhum arquivo selecionado'}
                                            </div>
                                            <input 
                                                type="file"
                                                className="form-control"
                                                id="graduationProofFile"
                                                name="graduationProofFile"
                                                onChange={(event) => {
                                                    actions.handleChange(event);
                                                    const files = event.currentTarget.files;
                                                    if(!verifyFileSize(files)) {
                                                        return
                                                    }
                                                    setCountFiles((prev) => !graduationProofFile && files.length > 0 ? prev + 1 : (graduationProofFile && files.length === 0 ? prev - 1 : prev));
                                                    setGraduationProofFile(files.length > 0 ? files : null);
                                                    setInvalidGraduationProofFile(files.length === 0);
                                                }}
                                                value={undefined}
                                                style={{display:'none'}}
                                            />
                                            <p className="input-error">
                                                <ErrorMessage name="graduationProofFile" className="input-error"/>
                                                {invalidGraduationProofFile ? 'Preencha este campo.' : ''}
                                            </p>
                                        </div>                                    
                                    </div>
                                </div> 
                            </div>  
                            <div className={style.boxFiles}>
                                <div className="col-md-12">   
                                    <label className={`mt-2 ${style.titleFileCategory}`}>Arquivos do Barema</label>
                                    <br />
                                    {baremaCategories?.map((baremaCategory, index) => (
                                        <>
                                            <label htmlFor="files" className="mt-4 form-label text-bold-500" key={index}>
                                                Categoria {index + 1}: {baremaCategory.name}
                                            </label>                       
                                            <label className={style.badgeMaxPoint}>Pontuação máxima: {baremaCategory.maxPoints}</label>  
                                            <br />                   
                                            {baremaCategory.subcategories.map((subcategory, idx) => (
                                                <>
                                                <label className="form-label mt-2" key={idx}>{subcategory.name}</label> 
                                                <label className={style.badgePoint}>{subcategory.points} {subcategory.points > 1 ? 'pontos' : 'ponto'}</label>  
                                                <br />
                                                <FieldArray
                                                    name={subcategory.uuid}
                                                    render={arrayHelpers => (
                                                        <>
                                                            {actions.values[subcategory.uuid] && actions.values[subcategory.uuid].length > 0 && (actions.values[subcategory.uuid].map((item, _idx) => (    
                                                                <div key={`${subcategory.uuid}.${_idx}`} className="row">  
                                                                    <div className="col-md-11">
                                                                        <div className="row">
                                                                            <label htmlFor={`${subcategory.uuid}.${_idx}`} className={`${style.fileButton} col-md-3`}>Escolher arquivo</label>
                                                                            <div className={`${style.fileName} col-md-9`}>{getFileName(subcategory.uuid, _idx)}</div>
                                                                            <input 
                                                                                type="file"
                                                                                className="form-control"
                                                                                id={`${subcategory.uuid}.${_idx}`}
                                                                                name={`${subcategory.uuid}.${_idx}`}
                                                                                onChange={(event) => {
                                                                                    actions.handleChange(event);
                                                                                    const files = event.currentTarget.files;
                                                                                    if(!verifyFileSize(files)) {
                                                                                        return;
                                                                                    }
                                                                                    handleFile(subcategory.uuid, _idx, files);
                                                                                }}
                                                                                value={undefined}
                                                                                style={{display:'none'}}
                                                                            />
                                                                        </div>
                                                                        <p className="input-error"><ErrorMessage name={`${subcategory.uuid}.${_idx}`} className="input-error" /></p>
                                                                    </div>
                                                                    <div className="col-md-1">
                                                                        {_idx !== 0 && 
                                                                            <button 
                                                                                className="btn btn-secondary"
                                                                                type="button" 
                                                                                onClick={async () => {
                                                                                    await removeFile(subcategory.uuid, _idx);
                                                                                    arrayHelpers.remove(_idx); 
                                                                                }}
                                                                            >-</button>}
                                                                        {_idx === 0 &&
                                                                            <button type="button" onClick={() => arrayHelpers.push('')} className="btn btn-primary">
                                                                                +
                                                                            </button>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )))}
                                                        </>
                                                    )}
                                                />   
                                                </>                                             
                                            ))}
                                        </>
                                    ))}
                                </div>
                            </div>
                            <div className={style.boxFiles}>  
                                <label htmlFor="processForms" className={`mt-2 ${style.titleFileCategoryForm}`}>Formulários</label>
                                {selectiveProcess.processForms && <div className={style.instructionsForm}>
                                    Efetue o download do formulário desejado, preencha-o e digitalize (ou tire uma foto) para efetuar o upload.
                                </div>}                                      
                                {selectiveProcess.processForms?.map((form, index) => (
                                    <>
                                    <label className="form-label row mt-2 display-inherit" key={index}>{form.name}                               
                                    <a href={form.url} className={style.titleFileForm} target="_blank">
                                        <FontAwesomeIcon icon={faFile} className={style.iconFileForm}/>Download
                                    </a>
                                    </label> 
                                    <div className="row">
                                        <label htmlFor={`form.${index}`} className={`${style.fileButton} col-md-3`}>
                                            Escolher arquivo
                                        </label>
                                        <div className={`${style.fileName} col-md-9`}>
                                            {getFileNameForm(form.name)}
                                        </div>
                                        <input 
                                            type="file"
                                            className="form-control"
                                            id={`form.${index}`}
                                            name={`form.${index}`}
                                            onChange={(event) => {
                                                actions.handleChange(event);
                                                const files = event.currentTarget.files;
                                                if(!verifyFileSize(files)) {
                                                    return;
                                                }
                                                handleFileForm(form.name, files);
                                            }}
                                            value={undefined}
                                            style={{display:'none'}}
                                        />
                                    </div>      
                                    </>                                             
                                ))}
                            </div>
                        </div>
                        <br />
                        <div className="text-center">
                            <button onClick={() => back(actions.values)} className="btn btn-secondary m-1" disabled={actions.isSubmitting}>Anterior</button>
                            <button type="submit" className="btn btn-primary m-1" disabled={actions.isSubmitting}>Concluir</button>
                        </div>
                    </Form>
                    )}
                </Formik>
            }
            {currentStage === 5 && currentSubscription &&
                <Formik
                    enableReinitialize
                    initialValues={generateForm()}                               
                    onSubmit={handleSubmit}>
                    {(actions) => (
                    <Form>
                        <div className="row mt-5 justify-content-center">
                            <div className={style.boxFiles}>
                                <label className={`mt-3 ${style.titleFileCategory}`}>Documentos Obrigatórios</label>
                                <div className="col-md-12">
                                    <div className="mb-3">                                    
                                        <div className="row">
                                            <label className="form-label text-bold-500">Documento pessoal com foto</label>
                                        </div>                                    
                                        <div className="row">
                                            <div className={`col-md-9`}>
                                                <span>                                  
                                                    <a href={currentSubscription?.documentFile} className={style.titleFile} target="_blank">
                                                        <FontAwesomeIcon icon={faFile} className={style.iconFile}/>Arquivo
                                                    </a>
                                                </span>
                                            </div>
                                        </div>                                    
                                    </div>
                                </div>                                                   
                                <div className="col-md-12">
                                    <div className="mb-3">
                                        <div className="row">
                                            <label className="form-label text-bold-500">Diploma da Graduação</label>
                                        </div>                                                                  
                                        <div className="row">
                                            <div className={`col-md-9`}>                      
                                                <a href={currentSubscription?.graduationProofFile} className={style.titleFile} target="_blank">
                                                    <FontAwesomeIcon icon={faFile} className={style.iconFile}/>Arquivo
                                                </a>
                                            </div>
                                        </div>     
                                    </div>
                                </div>  
                            </div>
                            <div className={style.boxFiles}>
                                <div className="col-md-12">                                      
                                    <label className={`mt-2 ${style.titleFileCategory}`}>Arquivos do Barema</label>
                                    <br />
                                    {currentSubscription && currentSubscription?.files && currentSubscription?.files.map((fileSubscription, index) => (
                                        <>
                                            <label htmlFor="files" className="form-label mt-3 text-bold-500" key={index}>
                                                {getSubcategoryName(fileSubscription.subcategoryID)}
                                            </label>   
                                            <div>                                     
                                            {fileSubscription.files.map((fileSubcategory, idx) => (
                                                <div className="mb-3">
                                                    <a href={fileSubcategory.url} className={style.titleFile} target="_blank">
                                                        <FontAwesomeIcon icon={faFile} className={style.iconFile}/>Arquivo {idx + 1}
                                                    </a>
                                                    <label className={fileSubcategory.status === SubscriptionStatus.DEFERIDA ? style.badgeSuccess : style.badgeDanger}>{fileSubcategory.status}</label>
                                                    <label className={style.observationFile}>{fileSubcategory.observation ? 'Observação: ' + fileSubcategory.observation : ''}</label>
                                                </div>      
                                            ))}
                                            </div> 
                                        </>
                                    ))}
                                </div>    
                            </div>  
                            <div className={style.boxFiles}>                      
                                <div className="col-md-12">   
                                    <label htmlFor="processForms" className={`mt-2 mb-4 ${style.titleFileCategoryForm}`}>Formulários</label>
                                    {currentSubscription && currentSubscription?.processForms && currentSubscription?.processForms.map((formFile, index) => (  
                                        <div>    
                                            <a href={formFile.url} className={style.titleFile} target="_blank" key={index}>
                                                <FontAwesomeIcon icon={faFile} className={style.iconFile}/> {formFile.name}
                                            </a>  
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <br />
                        <div className="text-center">
                            <button onClick={() => back(actions.values)} className="btn btn-secondary m-1" disabled={actions.isSubmitting}>Anterior</button>                        </div>
                    </Form>
                    )}
                </Formik>
            }
            {currentStage === 6 && 
                <div className="col-md-12 d-flex justify-content-center align-items-center mh-100 p-5">
                    <div>
                        <h1 className="text-primary-dark title-sm-font-size">
                            A sua inscrição está sendo processada.
                        </h1>                   
                        <h1 className="text-primary fw-bold title-sm-font-size" >
                            Aguarde...
                        </h1>                  
                        <h1 className="text-primary fw-bold title-sm-font-size" >
                            {percentage} %
                        </h1>
                    </div>
                    <img src="/images/subscription/processing.svg" className="img-fluid w-50" alt="..."></img>
                </div>
            }
            {currentStage === 7 && 
                <div className="col-md-12 d-flex justify-content-center align-items-center mh-100 p-5">
                    <img src="/images/subscription/completed.svg" className="img-fluid w-50" alt="..."></img>
                    <div>                    
                        <h1 className="text-primary-dark title-sm-font-size">
                            A sua inscrição foi concluída.
                        </h1>                   
                        <h1 className="text-primary fw-bold title-sm-font-size" >
                            <a href="/student/subscription" className={style.completedLink}>Acompanhe aqui</a>                    
                        </h1>
                    </div>
                </div>
            }
            {currentSubscription && 
                <div className="text-right">
                    Data de Inscrição: {(new Date(currentSubscription.subscriptionDate)).toLocaleString()}
                </div>
            }
            <WarningDialog open={openFileModal} actionButtonText="OK" title="Aviso" text={"O tamanho máximo do arquivo deve ser 4MB"} onClose={() => closeModal('file')} />
            <ConfirmDialog open={openConfirmationModal} actionButtonText="SIM" title="Concluir Inscrição" text="Ao concluir a inscrição os dados informados não poderão ser alterados. Tem certeza que deseja prosseguir?" onClose={() => closeModal('confirmation')} onConfirm={confirmSubscription} />
        </StudentBase>
    )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const permission = Permission();
  return await permission.checkPermission(ctx, [UserType.STUDENT]);
};

