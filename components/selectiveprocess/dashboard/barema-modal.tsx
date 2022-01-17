import { Document, Page, pdfjs } from "react-pdf";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { AnalysisSubCategory, AnalysisCategory } from "../subscription/subscription-barema-analysis";
import { SubscriptionFile } from "../../../models/subscription/subscription-file";
import { SubscriptionStatus } from "../../../models/subscription/subscription-resource.enum";

interface Props {
    onClose?: Function;
    file: SubscriptionFile;
    open: boolean;
    subCategory: AnalysisSubCategory;
    category: AnalysisCategory;
}
export default function BaremaModal(props: Props) {

    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


    const { open, onClose,subCategory } = props;
    const [numPages, setNumPages] = useState(null);
    const [pagesList, setPageList] = useState([]);
    const [isPDF, setIsPDF] = useState(false);
    const [selectedFile, setSelectedFile] = useState<SubscriptionFile>({ status: SubscriptionStatus.AGUARDANDO_ANALISE, uuid: "", url: "", observation: "" });


    useEffect(() => {
        if (props.file) {
            // setIsPDF(props.file.url.indexOf(".pdf") != -1);
            setIsPDF(true);
            setSelectedFile(props.file);
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

    function onPDFErro() {
        setIsPDF(false)
    }

    function close() {
        onClose ? onClose(selectedFile) : false;
    }

    const handleStatusChange = (evt) => {
        const file = JSON.parse(JSON.stringify(selectedFile));
        file.status = evt.target.value;
        setSelectedFile(file);
    }

    const handleObservationChange = (evt) => {
        const file = JSON.parse(JSON.stringify(selectedFile));
        file.observation = evt.target.value;
        setSelectedFile(file);
    }

    return (
        <div className={" modal fade   " + (open == true ? 'd-block show modal-open' : '')}  >
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{subCategory?.name}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={close}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row my-3">
                            <div className="col-12 text-center">
                                <a target="blank" href={selectedFile.url} className="link-primary">
                                    <b><FontAwesomeIcon icon={faFile} className="sm-icon mx-1" />Ver Original (Link do Arquivo)</b>
                                </a>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 text-center">
                                {(selectedFile?.url != undefined && isPDF) &&
                                    <Document 
                                        file={selectedFile.url}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        className={"w-100 d-flex flex-column"}
                                        noData={"Infelizmente não foi possível carregar esse documento"}
                                        error={"Infelizmente não foi possível carregar esse documento"}
                                        onLoadError={onPDFErro}
                                    >
                                        {pagesList.map((page, index) => {
                                            return <Page pageNumber={page} key={page} className={"w-100 d-flex"} />
                                        })}

                                    </Document>
                                }
                                {(selectedFile?.url != undefined && !isPDF) &&
                                    <img src={selectedFile.url} className="img-fluid"                                    >


                                    </img>
                                }
                            </div>
                        </div>
                        <div className="row my-5">
                            <div className="col-12">
                                <hr />
                            </div>
                            <div className="col-12 mt-3">
                                <label className="form-label">Parecer</label>
                                <select
                                    className="form-select "
                                    name="type"
                                    value={selectedFile.status}
                                    onChange={(e) => { handleStatusChange(e) }} >
                                    <option>{SubscriptionStatus.DEFERIDA}</option>
                                    <option>{SubscriptionStatus.INDEFERIDA}</option>
                                    <option>{SubscriptionStatus.AGUARDANDO_ANALISE}</option>

                                </select>
                            </div>
                            <div className="col-12 mt-3">
                                <label className="form-label">Justificativa</label>
                                <textarea id={"obs"} className="form-control " name="obs"
                                    value={selectedFile.observation} onChange={(e) => { handleObservationChange(e) }}></textarea>

                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-dark" data-bs-dismiss="modal" onClick={close}>Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}