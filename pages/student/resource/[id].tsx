import React, { useEffect, useState } from 'react'
import atob from 'atob';

import { APIRoutes } from '../../../utils/api.routes'
import style from '../../../styles/subscription.module.css';
import { useRouter } from 'next/router'
import Link from 'next/link';
import * as Yup from 'yup'
import { ErrorMessage, Field, FieldArray, Formik } from 'formik'
import API from '../../../lib/api.service';
import { GetServerSidePropsContext } from 'next';
import { UserType } from '../../../enum/type-user.enum';
import Permission from '../../../lib/permission.service';
import { Subscription, SubscriptionResource, SubscriptionStatus } from '../../../models/subscription/subscription';
import StudentBase from '../../../components/student/student-base';
import { APIResponse } from '../../../models/api-response';
import { ProcessStep, ProcessStepsTypes, SelectiveProcess } from '../../../models/subscription-process/selective-process';
import { ResourceStepsHelper } from '../../../helpers/resource-steps-helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import Loading from '../../../components/loading';
import SelectiveProcessUtil from '../../../lib/selectiveprocess.util';
import ResourceUtil from '../../../utils/resource.util';
import { FileHelper } from '../../../helpers/file-helper';
import WarningDialog from '../../../components/warning-dialog';


export default function SaveResourceLayout() {
    const [isLoading, setLoading] = useState<boolean>(true);
    const router = useRouter();
    const api = API();
    const resourceUtil = ResourceUtil();
    const {
      query: { subscriptionID, step },
    } = router;

    const [resource, setResource] = useState<SubscriptionResource>();
    const [files, setFiles] = useState<any>([]);
    const decodeStep = step ? atob(step as string) : null;
    const [openModal, setOpenModal] = useState<boolean>(false);

    function closeModal() {
        setOpenModal(false);
    }

    const verifyFileSize = (file)  => {
        const check = FileHelper.checkFileSize(file);
        setOpenModal(!check)
        return check
    }

    useEffect(() => {   
        const loadData = async () => {
            const resultSubscription: APIResponse = await api.get(APIRoutes.CURRENT_SUBSCRIPTION);
    
            if (!resultSubscription.result) {
              return;
            }
    
            const subscription: Subscription = resultSubscription.result;

            if(step){
                let resourceFound: SubscriptionResource = subscription.resources.find((resource) => decodeStep === resource.step);
                setResource(resourceFound);
            } else {
                const resultSelectiveProcess: APIResponse = await api.get(APIRoutes.SELECTIVE_PROCESS, { 'id': subscription.selectiveProcessID });
                const selectiveProcess: SelectiveProcess = resultSelectiveProcess.result;                            

                if(!resourceUtil.canRequestResource(subscription, selectiveProcess)) {
                    router.push("/student/resource");
                    return;
                }
            }

            setLoading(false);
        };    
    
        loadData();
      }, []);
      
    const buildArrayFiles = async (files) => {
        const arrayFiles = [];
        for (let j = 0; j < files.length; j++){
            const file = files[j];
            arrayFiles.push(file.file[0])
        }
        return arrayFiles;
    }

    const saveResource = async (values) => {
        delete values.files;
        const result = await api.post(APIRoutes.RESOURCES, { ...values, subscriptionID });
        if(result){
            const resourceID  = result.result.id;
            const arrayFiles = await buildArrayFiles(files);
            for (let j = 0; j < arrayFiles.length; j++){
                const file = arrayFiles[j];
                await api.postFile(APIRoutes.FILE_RESOURCE, { resourceID, subscriptionID }, file);
            }
        }
    };

    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true);
            await saveResource(values);
            router.push("/student/resource");
        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }

    const handleFile = async (position: any, file: FileList) => {
        const fileFound = files.find((file) => file.position === position);

        if(!fileFound){
            files.push({position, file});
            setFiles(files);
            return;
        }

        files.forEach((element) => {
            if(element.position === position){
                element.file = file;
            }
        });

        setFiles(files);
    }

    const getFileName = (position) => {
        const fileFound = files.find((file) => file.position === position);

        if(fileFound){
            return fileFound ? fileFound.file[0]?.name : 'Nenhum arquivo selecionado';
        }

        return 'Nenhum arquivo selecionado';
    }

    const removeFile = async (position) => {
        const newFiles = files.filter(file => file.position !== position)

        newFiles.forEach((element, index) => {
            element.position = index;
        });

        setFiles(newFiles)
    }

    if(isLoading){
        return (        
            <StudentBase>
                <Loading />
            </StudentBase>
        );
    }

    return (
        <StudentBase>
            <div className="row mb-3">
                <div className="col-6 text-left">                    
                    <h3 className="text-primary-dark">Recurso</h3>
                </div>
                <div className="col-6 text-right">
                    <Link href="/student/resource">
                        <a className="link-primary ">Voltar</a>
                    </Link>
                </div>
            </div>
            {resource && (
                <>
                    <b>Etapa:</b> {resource?.step}
                    <br />  
                    <b>Data:</b> {(new Date(resource?.date)).toLocaleString()}
                    <br />  
                    <b>Status:</b> {resource?.status}
                </>
            )}  
            <Formik
                enableReinitialize
                initialValues={{ justification: resource?.justification, files: [''] }}
                validationSchema={
                    Yup.object().shape({
                        justification: Yup.string().required('Preencha este campo.'),
                    })}
                onSubmit={onSubmit}>
                {({
                    values,
                    isSubmitting,
                    handleSubmit,
                    handleChange,
                    setFieldValue
                }) => (
                    <form onSubmit={handleSubmit}>                          
                        <div className="row mt-5 justify-content-center">
                            <div className="col-12">                     
                                <div className="mb-3">
                                    <label htmlFor="justification" className="form-label">Justificativa</label>
                                    <textarea
                                        className="form-control"
                                        name="justification"
                                        id="justification"
                                        rows={3}
                                        value={values.justification}
                                        onChange={handleChange}
                                        disabled={!!resource}
                                    ></textarea>
                                    <p className="input-error"><ErrorMessage name="justification" className="input-error" /></p>
                                </div>
                                {!resource && <div className="mb-3">
                                    <label className="form-label row mt-2">Arquivos</label>  
                                    <FieldArray
                                        name="files"
                                        render={arrayHelpers => (
                                            <>
                                                {values.files && values.files.length > 0 && (values.files.map((item, index) => (    
                                                    <div key={index} className="row">  
                                                        <div className="col-md-11">
                                                            <div className="row">
                                                                <label htmlFor={`files.${index}`} className={`${style.fileButton} col-md-3`}>Escolher arquivo</label>
                                                                <div className={`${style.fileName} col-md-9`}>{getFileName(index)}</div>
                                                                <input 
                                                                    type="file"
                                                                    className="form-control"
                                                                    id={`files.${index}`}
                                                                    name={`files.${index}`}
                                                                    onChange={(event) => {                                                                        
                                                                        const files = event.currentTarget.files;                                                   
                                                                        if(!verifyFileSize(files)) {
                                                                            setFieldValue(`files.${index}`, '');
                                                                            return;
                                                                        }
                                                                        handleChange(event);
                                                                        handleFile(index, event.currentTarget.files);
                                                                    }}
                                                                    value={undefined}
                                                                    style={{display:'none'}}
                                                                />
                                                            </div>
                                                            <p className="input-error"><ErrorMessage name={`files.${index}`} className="input-error" /></p>
                                                        </div>
                                                        <div className="col-md-1">
                                                            {index !== 0 && 
                                                                <button 
                                                                    className="btn btn-secondary"
                                                                    type="button" 
                                                                    onClick={async () => {
                                                                        await removeFile(index);
                                                                        arrayHelpers.remove(index); 
                                                                    }}
                                                                >-</button>}
                                                            {index === 0 &&
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
                                </div>}
                                {resource && resource.files?.length && 
                                    <div>                                     
                                        {resource.files.map((file, idx) => (
                                            <a href={file} className={style.titleFile} target="_blank">
                                                <FontAwesomeIcon icon={faFile} className={style.iconFile}/>Arquivo {idx + 1}
                                            </a>      
                                        ))}
                                    </div> 
                                }
                            </div>    
                        </div> 
                        {!resource && <div className="text-right">
                            <button type="submit" className="btn btn-primary mt-3 me-auto" disabled={isSubmitting}>Salvar</button>
                        </div>}
                    </form>
                )}
            </Formik>
            <WarningDialog open={openModal} actionButtonText="OK" title="Aviso" text={"O tamanho máximo do arquivo deve ser 4MB"} onClose={closeModal} />
        </StudentBase>
    )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const permission = Permission();
    return await permission.checkPermission(ctx, [UserType.STUDENT]);
  };

