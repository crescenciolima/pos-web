import { GetServerSidePropsContext, GetStaticProps, InferGetServerSidePropsType } from 'next'
import React, {useEffect, useState, useRef} from 'react'
import * as Yup from 'yup'
import {ErrorMessage, Field, FieldArray, Form, Formik} from 'formik'
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/core";
import MaskedInput from 'react-input-mask';
import DatePicker, { registerLocale, setDefaultLocale }  from "react-datepicker";
import ptBR from 'date-fns/locale/pt-BR';
import "react-datepicker/dist/react-datepicker.css";
import fire from '../../../utils/firebase-util';
import style from '../../../styles/subscription.module.css';
import { Subscription, SubscriptionFile, SubscriptionTypeFile } from "../../../models/subscription";
import { APIRoutes } from '../../../utils/api.routes';
import API from '../../../lib/api.service';
import Permission from '../../../lib/permission.service';
import { UserType } from '../../../enum/type-user.enum';
import StudentBase from '../../../components/student/student-base';
import { APIResponse } from '../../../models/api-response';
import { BaremaCategory, BaremaSubCategory, SelectiveProcess } from '../../../models/selective-process';
import { MaskHelper } from '../../../helpers/mask-helper';
import { useRouter } from 'next/router';
registerLocale('pt-BR', ptBR);

export default function SubscriptionLayout(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [loading, setLoading] = useState(true);
    const [reload, setReload] = useState(true);
    const api = API();
    const [subscription, setSubscription] = useState<Subscription>();
    const [currentStage, setCurrentStage] = useState(1);
    const [stageOneValues, setStageOneValues] = useState(null);
    const [stageTwoValues, setStageTwoValues] = useState(null);
    const [stageThreeValues, setStageThreeValues] = useState(null);
    const [stageFourValues, setStageFourValues] = useState(null);
    const [stageFiveValues, setStageFiveValues] = useState(null);
    const [stageSixValues, setStageSixValues] = useState(null);
    const [inConstruction, setInConstruction] = useState<boolean>(null);
    const [selectiveProcess, setSelectiveProcess] = useState<SelectiveProcess>(null);
    const [subCategoriesFiles, setSubCategoriesFiles] = useState<any>([]);
    const [baremaCategories, setBaremaCategories] = useState<any>(null);
    const [documentFile, setDocumentFile] = useState<FileList>();
    const [graduationProofFile, setGraduationProofFile] = useState<FileList>();
    const router = useRouter();
    const specialTreatmentTypes = [
        { name: "Prova em Braille", value: 'prova_braille' },
        { name: "Auxílio de Leitor/Ledor", value: 'auxilio_leitor' },
        { name: "Intérprete de Libras", value: 'interprete_libras' },
        { name: "Sala de Mais Acesso", value: 'sala_mais_acesso' },
        { name: "Auxílio para Transcrição", value: 'auxilio_transcricao' },
        { name: "Mesa e Cadeiras sem Braço", value : 'mesa_sem_braco' },
    ];

    const saveSubscription = async (values: Subscription) => {
        try {
            if(subscription){
                values = {...values, id: subscription.id};
            }
            const result = await api.post(APIRoutes.SUBSCRIPTION, values);
            console.log(result);
            if(result){
                setSubscription(result.result)
                return result.result;
            }

            //setReload(!reload);
        } catch (error) {
            console.error(error);
        }
    };

    const saveFileSubscription = async (values, files, type) => {
        console.log(values);
        try {
            const route = type === SubscriptionTypeFile.BAREMA ? APIRoutes.FILE_BAREMA_SUBSCRIPTION : APIRoutes.FILE_SUBSCRIPTION;
            const result = await api.postFile(route, values, files);
            console.log(result);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFile = async (subcategoryUuid, position, file) => {
        console.log(subCategoriesFiles, subcategoryUuid, position);
        const subcategoryFound = subCategoriesFiles.find((subcategory) => subcategory.uuid === subcategoryUuid);

        if(!subcategoryFound){
            subCategoriesFiles.push({uuid: subcategoryUuid, files: [{position: position, file: file}]});
            setSubCategoriesFiles(subCategoriesFiles)
            return;
        }

        let newPosition = true;
        const subCategoriesFilesUpdated = await subCategoriesFiles.map((subcategory) => {
            console.log(subcategory);
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
                subcategory.files.push({position: position, file: file})
            }
            
            return subcategory;
        });

        console.log(subCategoriesFilesUpdated)
        setSubCategoriesFiles(subCategoriesFilesUpdated)
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
        setSubCategoriesFiles(subCategoriesFilesUpdated)
        console.log(subCategoriesFilesUpdated)
    }
    
    const buildForm = async (_stageFiveValues) => {   
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
            postalCodeCompany: stageThreeValues.postalCodeCompany,
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
            selectiveProcessID: selectiveProcess.id,

            subscriptionDate: Date.now()
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

    const processDocumentFiles = async (subscriptionId) => {
        console.log(documentFile);

        const arrayFiles = [documentFile[0]];

        const values = {type: SubscriptionTypeFile.DOCUMENT, subscriptionID: subscriptionId};

        console.log(values);

        await saveFileSubscription(values, arrayFiles, SubscriptionTypeFile.DOCUMENT);
    }

    const processGraduationFiles = async (subscriptionId) => {
        console.log(graduationProofFile);

        const arrayFiles = [graduationProofFile[0]];
        const values = {type: SubscriptionTypeFile.GRADUATION, subscriptionID: subscriptionId};

        console.log(values);

        await saveFileSubscription(values, arrayFiles, SubscriptionTypeFile.GRADUATION);
    }

    const processFiles = async (subscriptionId) => {
        console.log(subCategoriesFiles);
        const arraySubcategories = []

        for (let i = 0; i < subCategoriesFiles.length; i++){
            const subcategoryFile = subCategoriesFiles[i];
            const files = subcategoryFile.files;            
            const arrayFiles = await buildArrayFiles(files);
            arraySubcategories.push({subcategoryID: subcategoryFile.uuid, subscriptionID: subscriptionId, files: arrayFiles})
        }

        console.log(arraySubcategories);

        for (let i = 0; i < arraySubcategories.length; i++){
            await saveFileSubscription({subcategoryID: arraySubcategories[i].subcategoryID, subscriptionID: arraySubcategories[i].subscriptionID}, arraySubcategories[i].files, SubscriptionTypeFile.BAREMA);
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
            console.log(values);
            setStageFiveValues(values);
            const subscription: Subscription = await buildForm(values);
            const result = await saveSubscription(subscription);
            await processFiles(result.id);
            await processDocumentFiles(result.id);
            await processGraduationFiles(result.id);
            //setCurrentStage(currentStage + 1);*/            
            router.push("/student");
        }
        window.scrollTo({top: 0, behavior: 'smooth'});
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
    
    useEffect(() => {
        api.get(APIRoutes.SELECTIVE_PROCESS, { 'inconstruction': "true" }).then(
          (result: APIResponse) => {
            if (result.result) {
                setInConstruction(true);
                setSelectiveProcess(result.result);
                let cloneCategories = JSON.parse(JSON.stringify(result.result.baremaCategories))
                cloneCategories.map((baremaCategory) => (
                    baremaCategory.subcategories.map((subcategory) => {
                        subcategory.files = [{position: 1, file: ''}]
                    })
                ))
                setBaremaCategories(cloneCategories);
            } else {
              setInConstruction(false);
            }
            setLoading(false);
            console.log(result)
          }
        )
    
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

    if(inConstruction === false){        
        return (
            <StudentBase>
                <div>
                    <p>Não existe processo seletivo aberto.</p>
                </div>
            </StudentBase>
        );
    }

    const generateForm = () => {
        const values = {};
        baremaCategories?.forEach((baremaCategory, index) => {                                          
            baremaCategory.subcategories.forEach((subcategory, index) => {
                values[subcategory.uuid] = [''];
            })
        })
        console.log(values);
        return values;
    }

    return (    
        <StudentBase>
            {currentStage === 1 && 
                <Formik
                    enableReinitialize
                    initialValues={
                        stageOneValues ? stageOneValues : {
                            name: '',
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
                        document: Yup.string().required('Preencha este campo.'),
                        identityDocument: Yup.string().required('Preencha este campo.'),
                        issuingAgency: Yup.string().required('Preencha este campo.'),
                        issuanceDate: Yup.date().required('Preencha este campo.').nullable(),
                    })}
                    onSubmit={handleSubmit}>
                    {(actions) => (
                    <Form>
                        <div className="row mt-5 justify-content-center">
                            <div className="col-6">
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Nome</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="name" 
                                        id="name" 
                                        value={actions.values.name}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="name" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="mb-3">
                                    <label htmlFor="birthdate" className="form-label">Data de Nascimento</label>                 
                                    <DatePicker 
                                        locale="pt-BR" 
                                        selected={actions.values.birthdate} 
                                        dateFormat="dd/MM/yyyy" 
                                        onChange={(date) => { actions.setFieldValue('birthdate', date); }} 
                                        className="form-control" 
                                        customInput={
                                            <MaskedInput maskChar="" mask="99/99/9999"/>
                                        }
                                    />                                        
                                    <p className="input-error"><ErrorMessage name="birthdate" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="mb-3">
                                    <label htmlFor="document" className="form-label">CPF</label>
                                    <Field 
                                        name="document"
                                        value={actions.values.document}                
                                        onChange={actions.handleChange} >
                                            {({field}) => {
                                                return (
                                                <MaskedInput
                                                    {...field}                                    
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
                            <div className="col-3">
                                <div className="mb-3">
                                    <label htmlFor="identityDocument" className="form-label">Documento de Identidade</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="identityDocument" 
                                        id="identityDocument" 
                                        value={actions.values.identityDocument}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="identityDocument" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-2">
                                <div className="mb-3">
                                    <label htmlFor="issuingAgency" className="form-label">Órgão Expedidor</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="issuingAgency" 
                                        id="issuingAgency" 
                                        value={actions.values.issuingAgency}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="issuingAgency" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="mb-3">
                                    <label htmlFor="issuanceDate" className="form-label">Data de Expedição</label>                                                   
                                    <DatePicker 
                                        locale="pt-BR" 
                                        selected={actions.values.issuanceDate} 
                                        dateFormat="dd/MM/yyyy" 
                                        onChange={(date) => { actions.setFieldValue('issuanceDate', date); }} 
                                        className="form-control" 
                                        customInput={
                                            <MaskedInput maskChar="" mask="99/99/9999"/>
                                        }
                                    />         
                                    <p className="input-error"><ErrorMessage name="issuanceDate" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="mb-3">
                                    <label htmlFor="phoneNumber" className="form-label">Telefone</label>
                                    <Field 
                                        name="phoneNumber"
                                        value={actions.values.phoneNumber}                
                                        onChange={actions.handleChange} >
                                            {({field}) => {
                                                return (
                                                <MaskedInput
                                                    {...field}                                    
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
                            <div className="col-4">
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
                            <div className="col-2">
                                <div className="mb-3">
                                    <label htmlFor="postalCode" className="form-label">CEP</label>    
                                    <Field 
                                        name="postalCode"
                                        value={actions.values.postalCode}                
                                        onChange={actions.handleChange} >
                                            {({field}) => {
                                                return (
                                                <MaskedInput
                                                    {...field}                                    
                                                    className="form-control"
                                                    maskChar=""
                                                    mask={MaskHelper.makeMask(field.value, '', 'cep')}
                                                />
                                                );
                                            }}
                                    </Field>            
                                    <p className="input-error"><ErrorMessage name="postalCode" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="mb-3">
                                    <label htmlFor="street" className="form-label">Endereço</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="street" 
                                        id="street" 
                                        value={actions.values.street}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="street" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-2">
                                <div className="mb-3">
                                    <label htmlFor="houseNumber" className="form-label">Número</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="houseNumber" 
                                        id="houseNumber" 
                                        value={actions.values.houseNumber}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="houseNumber" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="mb-3">
                                    <label htmlFor="complement" className="form-label">Complemento</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="complement" 
                                        id="complement" 
                                        value={actions.values.complement}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="complement" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="mb-3">
                                    <label htmlFor="district" className="form-label">Bairro</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="district" 
                                        id="district" 
                                        value={actions.values.district}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="district" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="mb-3">
                                    <label htmlFor="city" className="form-label">Cidade</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="city" 
                                        id="city" 
                                        value={actions.values.city}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="city" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-2">
                                <div className="mb-3">
                                    <label htmlFor="state" className="form-label">Estado</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="state" 
                                        id="state" 
                                        value={actions.values.state}                
                                        onChange={actions.handleChange} />                
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
                        <div className="row justify-content-center">
                            <div className="col-5">
                                <div className="mb-3">
                                    <label htmlFor="graduation" className="form-label">Graduação</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="graduation" 
                                        id="graduation" 
                                        value={actions.values.graduation}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="graduation" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-7">
                                <div className="mb-3">
                                    <label htmlFor="graduationInstitution" className="form-label">Instituição de obtenção do título de Graduação</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="graduationInstitution" 
                                        id="graduationInstitution" 
                                        value={actions.values.graduationInstitution}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="graduationInstitution" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-5">
                                <div className="mb-3">
                                    <label htmlFor="postgraduateLatoSensu" className="form-label">Pós-graduação Lato Sensu</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="postgraduateLatoSensu" 
                                        id="postgraduateLatoSensu" 
                                        value={actions.values.postgraduateLatoSensu}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="postgraduateLatoSensu" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-7">
                                <div className="mb-3">
                                    <label htmlFor="postgraduateLatoSensuInstitution" className="form-label">Instituição de obtenção do título de Pós-graduação Lato Sensu</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="postgraduateLatoSensuInstitution" 
                                        id="postgraduateLatoSensuInstitution" 
                                        value={actions.values.postgraduateLatoSensuInstitution}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="postgraduateLatoSensuInstitution" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-5">
                                <div className="mb-3">
                                    <label htmlFor="postgraduateStrictoSensu" className="form-label">Pós-graduação Stricto Sensu</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="postgraduateStrictoSensu" 
                                        id="postgraduateStrictoSensu" 
                                        value={actions.values.postgraduateStrictoSensu}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="postgraduateStrictoSensu" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-7">
                                <div className="mb-3">
                                    <label htmlFor="postgraduateStrictoSensuInstitution" className="form-label">Instituição de obtenção do título de Pós-graduação Stricto Sensu</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="postgraduateStrictoSensuInstitution" 
                                        id="postgraduateStrictoSensuInstitution" 
                                        value={actions.values.postgraduateStrictoSensuInstitution}                
                                        onChange={actions.handleChange} />                
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
                            postalCodeCompany: '',
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
                    validationSchema={Yup.object().shape({})}
                    onSubmit={handleSubmit}>
                    {(actions) => (
                    <Form>
                        <div className="row mt-5 justify-content-center">
                            <div className="col-6">
                                <div className="mb-3">
                                    <label htmlFor="profession" className="form-label">Atividade Profissional</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="profession" 
                                        id="profession" 
                                        value={actions.values.profession}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="profession" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="mb-3">
                                    <label htmlFor="company" className="form-label">Instituição ou Empresa de Atuação</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="company" 
                                        id="company" 
                                        value={actions.values.company}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="company" className="input-error" /></p>
                                </div>
                            </div>
                        </div>
                        <div className="row justify-content-center">
                            <div className="col-2">
                                <div className="mb-3">
                                    <label htmlFor="postalCodeCompany" className="form-label">CEP</label>       
                                    <Field 
                                        name="postalCodeCompany"
                                        value={actions.values.postalCodeCompany}                
                                        onChange={actions.handleChange} >
                                            {({field}) => {
                                                return (
                                                <MaskedInput
                                                    {...field}                                    
                                                    className="form-control"
                                                    maskChar=""
                                                    mask={MaskHelper.makeMask(field.value, '', 'cep')}
                                                />
                                                );
                                            }}
                                    </Field>      
                                    <p className="input-error"><ErrorMessage name="postalCodeCompany" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="mb-3">
                                    <label htmlFor="streetCompany" className="form-label">Endereço</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="streetCompany" 
                                        id="streetCompany" 
                                        value={actions.values.streetCompany}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="streetCompany" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-2">
                                <div className="mb-3">
                                    <label htmlFor="houseNumberCompany" className="form-label">Número</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="houseNumberCompany" 
                                        id="houseNumberCompany" 
                                        value={actions.values.houseNumberCompany}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="houseNumberCompany" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-5">
                                <div className="mb-3">
                                    <label htmlFor="complementCompany" className="form-label">Complemento</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="complementCompany" 
                                        id="complementCompany" 
                                        value={actions.values.complementCompany}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="complementCompany" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="mb-3">
                                    <label htmlFor="districtCompany" className="form-label">Bairro</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="districtCompany" 
                                        id="districtCompany" 
                                        value={actions.values.districtCompany}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="districtCompany" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="mb-3">
                                    <label htmlFor="cityCompany" className="form-label">Cidade</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="cityCompany" 
                                        id="cityCompany" 
                                        value={actions.values.cityCompany}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="cityCompany" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="mb-3">
                                    <label htmlFor="stateCompany" className="form-label">Estado</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="stateCompany" 
                                        id="stateCompany" 
                                        value={actions.values.stateCompany}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="stateCompany" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="mb-3">
                                    <label htmlFor="workShift" className="form-label">Turno de Trabalho</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="workShift" 
                                        id="workShift" 
                                        value={actions.values.workShift}                
                                        onChange={actions.handleChange} />                
                                    <p className="input-error"><ErrorMessage name="workShift" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="mb-3">
                                    <label htmlFor="workRegime" className="form-label">Carga Horária ou Regime de Trabalho</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="workRegime" 
                                        id="workRegime" 
                                        value={actions.values.workRegime}                
                                        onChange={actions.handleChange} />                
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
                            <div className="col-3">
                                <label htmlFor="disability" className="form-label">Portador de Deficiência</label>
                                <div role="group" aria-labelledby="my-radio-group"> 
                                    <div className={style.radioGroup}>
                                        <div className={style.radio}>
                                            <input type="radio" name="disability" value="1" onChange={actions.handleChange} checked={actions.values.disability === "1"}/>
                                            <label>Sim</label>
                                        </div>  
                                        <div className={style.radio}>
                                            <input type="radio" name="disability" value="0" onChange={actions.handleChange} checked={actions.values.disability === "0"} />
                                            <label>Não</label>                                  
                                        </div>
                                    </div>
                                    <p className="input-error"><ErrorMessage name="disability" className="input-error" /></p>
                                </div>
                            </div>
                            <div className="col-5">
                                {actions.values.disability === '1' && 
                                    <div className="mb-3">
                                        <label htmlFor="disabilityType" className="form-label">Tipo de Deficiência</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="disabilityType" 
                                            id="disabilityType" 
                                            value={actions.values.disabilityType}                
                                            onChange={actions.handleChange} />                
                                        <p className="input-error"><ErrorMessage name="disabilityType" className="input-error" /></p>
                                    </div>
                                }
                            </div>
                            <div className="col-4">
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
                            <div className="col-12">
                                <label htmlFor="reservedPlace" className="form-label">Concorrência às vagas destinadas para:</label>
                                <div role="group" aria-labelledby="my-radio-group"> 
                                    <div className={style.radioGroup}>
                                        <div className={style.radioReservedPlace}>
                                        <input type="radio" name="reservedPlace" value="ampla_concorrencia" onChange={actions.handleChange} checked={actions.values.reservedPlace === 'ampla_concorrencia'}/>
                                        <label>Ampla concorrência</label>
                                        </div>  
                                    </div>
                                    {selectiveProcess.reservedPlaces.map((reservedPlace, index) => (
                                        <div className={style.radioGroup} key={index}>
                                            <div className={style.radioReservedPlace}>
                                            <input type="radio" name="reservedPlace" value={reservedPlace.uuid} onChange={actions.handleChange} checked={actions.values.reservedPlace === reservedPlace.uuid}/>
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
            {currentStage === 5 && 
                <Formik
                    enableReinitialize
                    initialValues={generateForm()}                    
                    onSubmit={handleSubmit}>
                    {(actions) => (
                    <Form>
                        <div className="row mt-5 justify-content-center">
                            <div className="col-12">
                                <div className="mb-3">
                                    <label className="form-label row">Documento pessoal com foto</label>
                                    
                                    <div className="row">
                                        <label htmlFor="documentFile" className={`${style.fileButton} col-3`}>
                                            Escolher arquivo
                                        </label>
                                        <div className={`${style.fileName} col-9`}>
                                            {documentFile ? documentFile[0]?.name : 'Nenhum arquivo selecionado'}
                                        </div>
                                        <input 
                                            type="file"
                                            className="form-control"
                                            id="documentFile"
                                            name="documentFile"
                                            onChange={(event) => {
                                                actions.handleChange(event);
                                                console.log(event.currentTarget.files);
                                                setDocumentFile(event.currentTarget.files);
                                            }}
                                            value={undefined}
                                            style={{display:'none'}}
                                        />
                                    </div>                                    
                                </div>
                            </div>
                                                   
                            <div className="col-12">
                                <div className="mb-3">
                                    <label className="form-label row">Diploma da Graduação</label>
                                    
                                    <div className="row">
                                        <label htmlFor="graduationProofFile" className={`${style.fileButton} col-3`}>
                                            Escolher arquivo
                                        </label>
                                        <div className={`${style.fileName} col-9`}>
                                            {graduationProofFile ? graduationProofFile[0]?.name : 'Nenhum arquivo selecionado'}
                                        </div>
                                        <input 
                                            type="file"
                                            className="form-control"
                                            id="graduationProofFile"
                                            name="graduationProofFile"
                                            onChange={(event) => {
                                                actions.handleChange(event);
                                                console.log(event.currentTarget.files);
                                                setGraduationProofFile(event.currentTarget.files);
                                            }}
                                            value={undefined}
                                            style={{display:'none'}}
                                        />
                                    </div>                                    
                                </div>
                            </div>       
                            <div className="col-12">   
                                {baremaCategories?.map((baremaCategory, index) => (
                                    <>
                                        <label htmlFor="files" className="form-label row mt-5 text-bold" key={index}>
                                            {baremaCategory.name}
                                        </label>                                            
                                        {baremaCategory.subcategories.map((subcategory, idx) => (
                                            <>
                                            <label className="form-label row mt-2" key={idx}>{subcategory.name}</label>  
                                            <FieldArray
                                                name={subcategory.uuid}
                                                render={arrayHelpers => (
                                                    <>
                                                        {actions.values[subcategory.uuid] && actions.values[subcategory.uuid].length > 0 && (actions.values[subcategory.uuid].map((item, _idx) => (    
                                                            <div key={`${subcategory.uuid}.${_idx}`} className="row">  
                                                                <div className="col-11">
                                                                    <div className="row">
                                                                        <label htmlFor={`${subcategory.uuid}.${_idx}`} className={`${style.fileButton} col-3`}>Escolher arquivo</label>
                                                                        <div className={`${style.fileName} col-9`}>{getFileName(subcategory.uuid, _idx)}</div>
                                                                        <input 
                                                                            type="file"
                                                                            className="form-control"
                                                                            id={`${subcategory.uuid}.${_idx}`}
                                                                            name={`${subcategory.uuid}.${_idx}`}
                                                                            onChange={(event) => {
                                                                                actions.handleChange(event);
                                                                                console.log(event.currentTarget.files);
                                                                                handleFile(subcategory.uuid, _idx, event.currentTarget.files);
                                                                            }}
                                                                            value={undefined}
                                                                            style={{display:'none'}}
                                                                        />
                                                                    </div>
                                                                    <p className="input-error"><ErrorMessage name={`${subcategory.uuid}.${_idx}`} className="input-error" /></p>
                                                                </div>
                                                                <div className="col-1">
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
                        <br />
                        <div className="text-center">
                            <button onClick={() => back(actions.values)} className="btn btn-secondary m-1" disabled={actions.isSubmitting}>Anterior</button>
                            <button type="submit" className="btn btn-primary m-1" disabled={actions.isSubmitting}>Concluir</button>
                        </div>
                    </Form>
                    )}
                </Formik>
            }
            {currentStage === 6 && 
                <p>Inscrição realizada com sucesso!</p>
            }
        </StudentBase>
    )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const permission = Permission();
  return await permission.checkPermission(ctx, [UserType.STUDENT]);
};

