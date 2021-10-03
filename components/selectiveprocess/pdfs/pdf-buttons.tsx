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

  let { process, document, currentStep } = props;
  const [isLoading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<string>("");
  const [instance, update] = usePDF({ document: document });

  const api = API(setLoading);

  Font.register({
    family: 'Poppins', fonts: [
      { src: "/fonts/Poppins-Regular.ttf" }, // font-style: normal, font-weight: normal
      { src: "/fonts/Poppins-Bold.ttf", fontWeight: 700 },
    ]
  });

  const disponibilizarResultado = async () => {
    if (!isLoading) {
      if (instance.loading == false && instance.url) {
        if (uploadedFile.length == 0) {
          const body = {
            id: process.id,
            currentStepType: currentStep.type
          }
          const blob = await pdf(document).toBlob();

          const result: APIResponse = await api.postFile(APIRoutes.SELECTIVE_PROCESS_RESULTS_SUBMISSION, body, blob);
          const savedStep: ProcessStep = result.result;
          console.log(savedStep.resultURL);
          setUploadedFile(savedStep.resultURL);
        }

        setModalOpen(true);

      }
    }

  }

  const onModalClose = () => {
    setModalOpen(false);
  }




  return (
    <>
      <div className="row justify-content-end">
        <div className="col-auto">
          <button className="btn btn-outline-primary" onClick={disponibilizarResultado} disabled={isLoading}>
            {(!isLoading && !instance.loading)&& "Disponibilizar Resultados"}
            {(isLoading && !instance.loading) && "Enviando arquivo..."}
            {instance.loading && "Carregando documento..."}
          </button>
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

      <ResultPostModal open={modalOpen} onClose={onModalClose} selectiveProcess={process} fileURL={uploadedFile}></ResultPostModal>
    </>
  )


}