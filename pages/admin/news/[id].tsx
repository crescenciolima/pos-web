import React, { useEffect, useState } from 'react'

import AdminBase from '../../../components/admin/admin-base'
import { APIRoutes } from '../../../utils/api.routes'
import { News } from '../../../models/news';
import { useRouter } from 'next/router'
import Link from 'next/link';
import * as Yup from 'yup'
import { ErrorMessage, Formik } from 'formik'
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import { FileHelper } from '../../../helpers/file-helper';
import WarningDialog from '../../../components/warning-dialog';

export default function SaveNewsLayout() {

    const router = useRouter();
    const api = API();

    const [news, setNews] = useState<News>({
        title: "", text: "", coverURL: "", date: Date.now(), slug:""
    });
    const [file, setFile] = useState<FileList>();
    const [newsContent, setNewsContent] = useState('');
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
                getNews(id.toString());
            }
        }

    }, [router.query]);

    const getNews = async (id: string) => {
        //Recupera o valor do banco de dados
        const result: APIResponse = await api.get(APIRoutes.NEWS, { 'id': id });
        const news: News = result.result;
        setNews(news);
    }

    const saveNews = async (values: News) => {
        if (news.coverURL != "") {
            values = { ...values, coverURL: news.coverURL };
        }
        values.text = newsContent;
        values.date = Date.now();
        await api.postFile(APIRoutes.NEWS, values, file && file.length > 0 ? file[0] : null);
    };

    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true);
            await saveNews(values); 
            router.push("/admin/news");
        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }

    function handleSunEditorBlur(event, editorContents){
        setNewsContent(editorContents)
    }



    return (
        <AdminBase>
            <div className="row mb-3">
                <div className="col-12 text-right">
                    <Link href="/admin/news">
                        <a className="link-primary ">Voltar</a>
                    </Link>
                </div>
            </div>
            <Formik
                enableReinitialize
                initialValues={{ ...news, coverURL:"", file:undefined }}
                validationSchema={
                    Yup.object().shape({
                        title: Yup.string().required('Preencha este campo.'),
                        coverURL: news.coverURL ? null : Yup.string().required('Preencha este campo.'),
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
                            <label htmlFor="title" className="form-label">Título</label>
                            <input
                                type="text"
                                className="form-control"
                                name="title"
                                id="title"
                                placeholder="Título da notícia"
                                value={values.title}
                                onChange={handleChange} />
                            <p className="input-error"><ErrorMessage name="title" /></p>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="coverURL" className="form-label">Capa</label>
                            <input
                                type="file"
                                className="form-control"
                                name="coverURL"
                                id="coverURL"
                                value={values.coverURL}
                                onChange={(event) => {                                    
                                    const files = event.currentTarget.files;                                                   
                                    if(!verifyFileSize(files)) {
                                        setFieldValue('coverURL', '');
                                        return;
                                    }
                                    handleChange(event);
                                    setFile(files);
                                }} />
                            <p className="input-info">*Os arquivos devem ter no máximo 4MB</p>
                            <p className="input-error"><ErrorMessage name="coverURL" /></p>
                        </div>
                        {news.coverURL &&
                            <div className="mb-3 text-center">
                                <img src={news.coverURL} className="img-thumbnail rounded" alt="..."></img>
                            </div>
                        }

                        <div className="mb-3">
                            <label htmlFor="about" className="form-label">Texto</label>
                            <SunEditor onBlur={handleSunEditorBlur} setContents={news.text}  setOptions={{
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

