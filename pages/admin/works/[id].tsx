import React, { useEffect, useState } from 'react'

import AdminBase from '../../../components/admin/admin-base'
import { APIRoutes } from '../../../utils/api.routes'
import { Works } from '../../../models/works';
import { useRouter } from 'next/router'
import Link from 'next/link';
import * as Yup from 'yup'
import { ErrorMessage, Field, FieldArray, Formik } from 'formik'
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import style from '../../../styles/works.module.css';
import { GetServerSidePropsContext } from 'next';
import { UserType } from '../../../enum/type-user.enum';
import Permission from '../../../lib/permission.service';
import { FileHelper } from '../../../helpers/file-helper';
import WarningDialog from '../../../components/warning-dialog';

export default function SaveWorksLayout() {

    const router = useRouter();
    const api = API();

    const [works, setWorks] = useState<Works>();
    const [file, setFile] = useState<FileList>();
    const [worksContent, setWorksContent] = useState('');
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
        const { id } = router.query;
        if (id) {
            if (id.toString() == "new") {
            } else {
                getWorks(id.toString());
            }
        }

    }, [router.query]);

    const getWorks = async (id: string) => {
        const result: APIResponse = await api.get(APIRoutes.WORKS, { 'id': id });
        const works: Works = result.result;
        setWorks(works);
    }

    const saveWorks = async (values: Works) => {
        try {
            if(works?.id){
                values.id = works.id
            }
            if(works?.url){
                values.url = works.url
            }
            values.text = worksContent;
            await api.postFile(APIRoutes.WORKS, values, file && file.length > 0 ? file[0] : null);    
        } catch (e) {
            console.error(e);
        }
    };

    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true);
            await saveWorks(values); 
            router.push("/admin/works");
        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }

    function handleSunEditorBlur(event, editorContents){
        setWorksContent(editorContents)
    }



    return (
        <AdminBase>
            <div className="row mb-3">
                <div className="col-12 text-right">
                    <Link href="/admin/works">
                        <a className="link-primary ">Voltar</a>
                    </Link>
                </div>
            </div>
            <Formik
                enableReinitialize
                initialValues={{ 
                    title: works?.title ? works?.title : '',
                    text: works?.text ? works?.text : '',
                    authors: works?.authors ? works?.authors : ['']
                 }}
                validationSchema={
                    Yup.object().shape({
                        title: Yup.string().required('Preencha este campo.'),
                        file: works?.url ? null : Yup.string().required('Preencha este campo.'),
                        authors: Yup.array()
                            .required('Preencha este campo.')
                            .min(1, 'Defina ao menos um autor.')
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
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">Título<span>*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                name="title"
                                id="title"
                                placeholder="Título do trabalho"
                                value={values.title}
                                onChange={handleChange} />
                            <p className="input-error"><ErrorMessage name="title"/></p>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Autores<span>*</span></label>  
                            <FieldArray
                                name="authors"
                                render={arrayHelpers => (
                                    <>
                                        {values.authors && values.authors.length > 0 && (values?.authors?.map((item, index) => (    
                                            <div key={index} className={style.rowAuthor}>  
                                                <div className={style.inputAuthor}>
                                                    <Field 
                                                        type="text"
                                                        className={`form-control`}
                                                        id={`authors.${index}`}
                                                        name={`authors.${index}`}
                                                        value={item}
                                                        onChange={handleChange}
                                                    />                           
                                                    <p className="input-error"><ErrorMessage name={`authors.${index}`}/></p>
                                                </div>
                                                {index !== 0 && 
                                                    <button className={`btn btn-secondary ${style.buttonAuthor}`}
                                                        type="button" 
                                                        onClick={async () => {
                                                            arrayHelpers.remove(index); 
                                                        }}
                                                    >-</button>}
                                                {index === 0 &&
                                                    <button type="button" onClick={() => arrayHelpers.push('')} className={`btn btn-primary ${style.buttonAuthor}`}>
                                                        +
                                                    </button>
                                                }
                                            </div>
                                        )))}
                                    </>
                                )}
                            />   
                        </div>
                        <div className="mb-3">
                            <label htmlFor="file" className="form-label">Arquivo{!works?.url && <span>*</span>}</label>
                            <input
                                type="file"
                                className="form-control"
                                name="file"
                                id="file"
                                value={values.file}
                                onChange={(event) => {                                
                                    const files = event.currentTarget.files;                                                   
                                    if(!verifyFileSize(files)) {
                                        setFieldValue('file', '');
                                        return;
                                    }
                                    handleChange(event);
                                    setFile(files);
                                }} />
                            <p className="input-info">*Os arquivos devem ter no máximo 4MB</p>
                            <p className="input-error"><ErrorMessage name="file" /></p>
                        </div>
                        {works?.url &&
                            <a href={works.url} className={style.titleFile} target="_blank">
                                <FontAwesomeIcon icon={faFile} className={style.iconFile}/>Arquivo
                            </a>
                        }
                        <div className="mb-3">
                            <label htmlFor="text" className="form-label">Texto</label>
                            <SunEditor onBlur={handleSunEditorBlur} setContents={works?.text}  setOptions={{
                                height: "400",
                                font: [
                                    'Roboto',
                                    'Poppins',
                                    'Courier New,Courier'
                                ],
                                colorList: [
                                    '#333333', '#34A853', '#FEE2E1', '#F48221', '#FAFAFA', '#ccc', '#dedede', 'OrangeRed', 'Orange', 'RoyalBlue', 'SaddleBrown', 'SlateGray', 'BurlyWood', 'DeepPink', 'FireBrick', 'Gold', 'SeaGreen'
                                ],
                                buttonList: [['font', 'fontSize', 'formatBlock', 'align', 'bold', 'underline', 'italic', 'strike',], ['fontColor', 'hiliteColor', 'image', 'fullScreen']]
                            }} />
                        </div>

                        <div className="text-right">
                            <button type="submit" className="btn btn-primary mt-3 me-auto" disabled={isSubmitting}>Salvar</button>
                        </div>
                    </form>
                )}
            </Formik>            
            <WarningDialog open={openModal} actionButtonText="OK" title="Aviso" text={"O tamanho máximo do arquivo deve ser 4MB"} onClose={closeModal} />
        </AdminBase>
    )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const permission = Permission();
    return await permission.checkPermission(ctx, [UserType.MASTER, UserType.ADMIN]);
  };

