import React, { useEffect, useRef, useState } from "react";
import { Formik, ErrorMessage } from "formik";
import SunEditor from "suneditor-react";
import * as Yup from 'yup'
import { News } from "../../../models/news";
import 'suneditor/dist/css/suneditor.min.css';
import { SelectiveProcess } from "../../../models/subscription-process/selective-process";
import { APIRoutes } from "../../../utils/api.routes";
import API from "../../../lib/api.service";
import { SubscriptionFile } from "../../../models/subscription/subscription-file";
import { SubscriptionStatus } from "../../../models/subscription/subscription-resource.enum";

interface Props {
    onClose?: Function;
    selectiveProcess: SelectiveProcess;
    open: boolean;
    fileURL: string;
}
export default function ResultPostModal(props: Props) {

    const api = API();

    const { open, onClose, fileURL } = props;
    const [selectedFile, setSelectedFile] = useState<SubscriptionFile>({ status: SubscriptionStatus.AGUARDANDO_ANALISE, uuid: "", url: "", observation: "" });

    const [news, setNews] = useState<News>({
        title: "", text: "", coverURL: "", date: Date.now(), slug: ""
    });
    const [newsContent, setNewsContent] = useState('');
    const [file, setFile] = useState<FileList>();

    useEffect(() => {
  
        if (props.selectiveProcess.steps) {
            const { selectiveProcess } = props;
            const step = selectiveProcess.steps[selectiveProcess.currentStep];
            let preContent = `
            <h5>Resultado Disponível</h5>
            <p>${step.type}</p>
            <a style="margin-top:1rem;color: rgb(52, 168, 83);" href="${fileURL}" target="_blank">Acesse clicando aqui.<a/>
            `
            setNewsContent(preContent);
            setNews({ ...news, title: step.type, text: preContent, coverURL: "https://firebasestorage.googleapis.com/v0/b/posweb-b42dd.appspot.com/o/news%2Fdefault.png?alt=media&token=d6c4f2b7-151d-4f84-90c8-668dff4c15b7" })
        }
    }, [props]);




    function close() {

        onClose ? onClose(selectedFile) : false;
    }



    function handleSunEditorBlur(event, editorContents) {
        setNewsContent(editorContents)
    }

    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true);
            await saveNews(values);
        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }


    const saveNews = async (values: News) => {
        if (news.coverURL != "") {
            values = { ...values, coverURL: news.coverURL };
        }
        values.text = newsContent;
        values.date = Date.now();
        await api.postFile(APIRoutes.NEWS, values, file ? (file.length > 0 ? file[0] : null) : null);
        close();
    };

    return (
        <div className={" modal fade   " + (open == true ? 'd-block show modal-open' : '')}  >
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Criar postagem do resultado</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={close}></button>
                    </div>
                    <div className="modal-body text-left">

                        <Formik
                            enableReinitialize
                            initialValues={{ ...news, coverURL: "", file: undefined }}
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
                                <>
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3 text-start">
                                            <label htmlFor="title" className="form-label">Título</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="title"
                                                id="title"
                                                placeholder="Título da notícia"
                                                value={values.title}
                                                onChange={handleChange} />
                                            <ErrorMessage name="title" className="input-error" />
                                        </div>
                                        <div className="mb-3 text-start">
                                            <label htmlFor="photo" className="form-label">Capa</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                name="coverURL"
                                                id="coverURL"
                                                value={values.coverURL}
                                                onChange={(event) => {
                                                    handleChange(event);
                                                    setFile(event.currentTarget.files);
                                                }} />

                                            <ErrorMessage name="coverURL" className="input-error" />
                                        </div>
                                        {news.coverURL &&
                                            <div className="mb-3 text-center">
                                                <img src={news.coverURL} className="img-thumbnail rounded" alt="..."></img>
                                            </div>
                                        }

                                        <div className="mb-3 text-start">
                                            <label htmlFor="about" className="form-label">Texto</label>
                                            {open && <SunEditor onBlur={handleSunEditorBlur} setContents={news.text} setOptions={{
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
                                            }
                                        </div>


                                        <div className="row my-3">
                                            <div className="col-12 text-start">
                                                <h6>Link do arquivo:</h6>
                                                <a href={fileURL} target="_blank">{fileURL}</a>
                                            </div>
                                        </div>

                                        <div className="modal-footer">
                                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Publicar</button>
                                            <button type="button" className="btn btn-dark" data-bs-dismiss="modal" onClick={close}>Fechar</button>
                                        </div>
                                    </form>

                                </>
                            )}
                        </Formik>



                    </div>

                </div>
            </div>
        </div>
    );
}