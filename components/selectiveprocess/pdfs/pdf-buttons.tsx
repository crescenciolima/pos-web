import React, { useEffect, useState } from 'react';
import ReactPDF, { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Font, usePDF, pdf } from '@react-pdf/renderer';
import { ProcessStep, SelectiveProcess } from '../../../models/selective-process';
import PDFHeader from './components/pdf-header';
import PDFTable, { PDFTableInfo } from './components/pdf-table';
import { FinalListGroup } from '../dashboard/final-result';
import API from '../../../lib/api.service';
import { APIRoutes } from '../../../utils/api.routes';
import { APIResponse } from '../../../models/api-response';
import { DocumentProps } from 'next/document';
import ResultPostModal from '../dashboard/result-post-modal';

// Create styles


interface Props {
  process: SelectiveProcess;
  currentStep: ProcessStep;
  document: React.ReactElement;
}

export default function PDFButtons(props: Props) {

  const { process, document, currentStep } = props;
  const [isLoading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const api = API(setLoading);

  Font.register({ family: 'Poppins', fonts: [
    { src: "/fonts/Poppins-Regular.ttf" }, // font-style: normal, font-weight: normal
    { src: "/fonts/Poppins-Bold.ttf", fontWeight: 700 },
   ]});

  const disponibilizarResultado = async () => {
    setModalOpen(true);
    // if (instance.loading == false && instance.url) {
    //   const body = {
    //     id: process.id,
    //   }
    //   const blob = await pdf(document).toBlob();

    //   const result: APIResponse = await api.postFile(APIRoutes.SELECTIVE_PROCESS_RESULTS_SUBMISSION, body, blob);
    //   console.log(result);

    // }
  }

  const onModalClose = () =>{
    setModalOpen(false);
  }

  
  const [instance, update] = usePDF({ document: document });


  return (
    <>
    <div className="row justify-content-end">
      <div className="col-auto">
        <button className="btn btn-outline-primary" onClick={disponibilizarResultado}>Disponibilizar Resultados</button>
      </div>
      <div className="col-auto">
        <PDFDownloadLink
          document={document}
          fileName={currentStep.type + ".pdf"}
          style={{
            textDecoration: "none",
            padding: "6px 12px",
            display: "flex",
            color: "#0d6efd",
            backgroundColor: "#ffffff",
            border: "1px solid #0d6efd",

          }}
        >
          {({ blob, url, loading, error }) =>
            loading ? "Carregando documento..." : "Download Pdf"
          }
        </PDFDownloadLink>
      </div>

    </div>

    <ResultPostModal open={modalOpen} onClose={onModalClose} selectiveProcess={process}></ResultPostModal>
    </>
  )


}