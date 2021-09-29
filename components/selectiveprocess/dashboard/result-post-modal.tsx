import { SubscriptionFile, SubscriptionStatus } from "../../../models/subscription";
import { Document, Page, pdfjs } from "react-pdf";
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { AnalysisSubCategory, AnalysisCategory } from "../subscription/subscription-barema-analysis";
import { Formik, ErrorMessage } from "formik";
import SunEditor from "suneditor-react";
import news from "../../../pages/api/news";
import * as Yup from 'yup'
import { News } from "../../../models/news";
import fire from "../../../utils/firebase-util";
import 'suneditor/dist/css/suneditor.min.css';
import { SelectiveProcess } from "../../../models/selective-process";

interface Props {
    onClose?: Function;
    selectiveProcess: SelectiveProcess;
    open: boolean;
}
export default function ResultPostModal(props: Props) {


    const { open, onClose, } = props;
    const [numPages, setNumPages] = useState(null);
    const [pagesList, setPageList] = useState([]);
    const [isPDF, setIsPDF] = useState(false);
    const [selectedFile, setSelectedFile] = useState<SubscriptionFile>({ status: SubscriptionStatus.AGUARDANDO_ANALISE, uuid: "", url: "", observation: "" });

    const [news, setNews] = useState<News>({
        title: "", text: "", coverURL: "", date: fire.firestore.Timestamp.now().seconds, slug: ""
    });
    const [newsContent, setNewsContent] = useState('');
    const [file, setFile] = useState<FileList>();

    useEffect(() => {
        // if (props.file) {
        //     setIsPDF(props.file.url.indexOf(".pdf") != -1);
        //     setSelectedFile(props.file);
        // }
        if (props.selectiveProcess.steps) {
            const { selectiveProcess } = props;
            const step = selectiveProcess.steps[selectiveProcess.currentStep];
            let preContent = `
            <h2>Resultado Disponível</h2>
            <p>${step.type}</p>
            `
            console.log(preContent)
            setNewsContent(preContent);
            setNews({ ...news, title: step.type, text: preContent })
        }
    }, [props]);


    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        if (numPages) {
            let pagesList = [];
            for (let i = 1; i <= numPages; i++) {
                pagesList.push(i);
            }
            setPageList(pagesList);
        }
    }

    function close() {

        onClose ? onClose(selectedFile) : false;
    }



    function handleSunEditorBlur(event, editorContents) {
        setNewsContent(editorContents)
    }

    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true);
            // await saveNews(values);
        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }

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

                                </form>
                            )}
                        </Formik>
                    </div>
                    <div className="modal-footer">
                        {/* <button type="submit" className="btn btn-primary mt-3 me-auto" disabled={isSubmitting}>Salvar</button> */}
                        <button type="button" className="btn btn-dark" data-bs-dismiss="modal" onClick={close}>Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}