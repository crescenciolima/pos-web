import { SubscriptionFile } from "../../../models/subscription";
import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";

interface Props {
    onClose?: Function;
    file: SubscriptionFile;
    open: boolean;
}
export default function BaremaModal(props: Props) {

    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


    const { open, onClose, file } = props;
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }
    // if (!open) {
    //     return <></>;
    // }

    function close() {
        onClose ? onClose() : false;
    }



    return (
        <div className={" modal fade   " + (open == true ? 'd-block show modal-open' : '')}  >
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title"></h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={close}></button>
                    </div>
                    <div className="modal-body">
                        {file?.url}
                        {file?.url != undefined && <Document onLoadError={console.error}
                            file={file.url}
                            onLoadSuccess={onDocumentLoadSuccess}
                        >
                            <Page pageNumber={pageNumber} />
                        </Document>
                        }
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={close}>Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}