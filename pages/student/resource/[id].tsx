import React, { useEffect, useState } from 'react'

import { APIRoutes } from '../../../utils/api.routes'
import style from '../../../styles/subscription.module.css';
import { useRouter } from 'next/router'
import Link from 'next/link';
import * as Yup from 'yup'
import { ErrorMessage, Field, FieldArray, Formik } from 'formik'
import { toast } from 'react-nextjs-toast'
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import { GetServerSidePropsContext } from 'next';
import { UserType } from '../../../enum/type-user.enum';
import Permission from '../../../lib/permission.service';
import { SubscriptionResource } from '../../../models/subscription';
import StudentBase from '../../../components/student/student-base';

export default function SaveResourceLayout() {
    const router = useRouter();
    const {
      query: { subscriptionID },
    } = router;
    const api = API();

    const [resource, setResource] = useState<SubscriptionResource>();
    const [files, setFiles] = useState<any>([]);


    const buildArrayFiles = async (files) => {
        const arrayFiles = [];
        for (let j = 0; j < files.length; j++){
            const file = files[j];
            arrayFiles.push(file.file[0])
        }
        return arrayFiles;
    }

    const saveResource = async (values) => {
        const arrayFiles = await buildArrayFiles(files);
        api.postFile(APIRoutes.RESOURCES, { ...values, subscriptionID }, arrayFiles);
    };

    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true);
            await saveResource(values);
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
        console.log(newFiles)
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
            <Formik
                enableReinitialize
                initialValues={{ ...resource, files: [''] }}
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
                                    ></textarea>
                                    <p className="input-error"><ErrorMessage name="justification" className="input-error" /></p>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label row mt-2">Arquivos</label>  
                                    <FieldArray
                                        name="files"
                                        render={arrayHelpers => (
                                            <>
                                                {values.files && values.files.length > 0 && (values.files.map((item, index) => (    
                                                    <div key={index} className="row">  
                                                        <div className="col-11">
                                                            <div className="row">
                                                                <label htmlFor={`files.${index}`} className={`${style.fileButton} col-3`}>Escolher arquivo</label>
                                                                <div className={`${style.fileName} col-9`}>{getFileName(index)}</div>
                                                                <input 
                                                                    type="file"
                                                                    className="form-control"
                                                                    id={`files.${index}`}
                                                                    name={`files.${index}`}
                                                                    onChange={(event) => {
                                                                        handleChange(event);
                                                                        console.log(event.currentTarget.files);
                                                                        handleFile(index, event.currentTarget.files);
                                                                    }}
                                                                    value={undefined}
                                                                    style={{display:'none'}}
                                                                />
                                                            </div>
                                                            <p className="input-error"><ErrorMessage name={`files.${index}`} className="input-error" /></p>
                                                        </div>
                                                        <div className="col-1">
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
                                </div>   
                            </div>    
                        </div> 
                        <div className="text-right">
                        <button type="submit" className="btn btn-primary mt-3 me-auto" disabled={isSubmitting}>Salvar</button>
                        </div>
                    </form>
                )}
            </Formik>
        </StudentBase>
    )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const permission = Permission();
    return await permission.checkPermission(ctx, [UserType.STUDENT]);
  };

