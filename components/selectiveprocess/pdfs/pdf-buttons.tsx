import React, { useEffect, useState } from 'react';
import ReactPDF, { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Font, usePDF, pdf } from '@react-pdf/renderer';
import { ProcessStep, SelectiveProcess } from '../../../models/subscription-process/selective-process';
import PDFHeader from './components/pdf-header';
import PDFTable, { PDFTableInfo } from './components/pdf-table';
import { FinalListGroup } from '../dashboard/final-result';
import API from '../../../lib/api.service';
import { APIRoutes } from '../../../utils/api.routes';
import { APIResponse } from '../../../models/api-response';
import { DocumentProps } from 'next/document';
import ResultPostModal from '../dashboard/result-post-modal';
import ConfirmDialog from '../../confirm-dialog';
import SelectiveProcessUtil from '../../../lib/selectiveprocess.util';
import { Subscription } from '../../../models/subscription/subscription';

// Create styles


interface Props {
  process: SelectiveProcess;
  currentStep: ProcessStep;
  document: React.ReactElement;
  subscriptionList: Subscription[];
  setBaseProcess: Function;
}

export default function PDFButtons(props: Props) {

  let { process, document, currentStep, subscriptionList, setBaseProcess } = props;
  const [isLoading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<string>("");
  const [instance, update] = usePDF({ document: document });

  const api = API(setLoading);
  const processUtil = SelectiveProcessUtil();

  Font.register({
    family: 'Poppins', fonts: [
      { src: "/fonts/Poppins-Regular.ttf" }, // font-style: normal, font-weight: normal
      { src: "/fonts/Poppins-Bold.ttf", fontWeight: 700 },
    ]
  });


  const openDialog = () => {
    setConfirmDialogOpen(processUtil.isCurrentStepValid(process, subscriptionList, true))
  }

  const clseDialog = () => {
    setConfirmDialogOpen(false)
  }


  const disponibilizarResultado = async () => {
    if (!isLoading) {
      if (instance.loading == false && instance.url) {
        setConfirmDialogOpen(false);

        if (uploadedFile.length == 0) {
          const body = {
            id: process.id,
            currentStepType: currentStep.type
          }
          const blob = await pdf(document).toBlob();

          const result: APIResponse = await api.postFile(APIRoutes.SELECTIVE_PROCESS_RESULTS_SUBMISSION, body, blob);
          const savedStep: ProcessStep = result.result;
          for (let step of process.steps) {
            if (step.order == process.currentStep) {
              step.resultURL = savedStep.resultURL
            }
          }
          setBaseProcess(process);
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
          <button type="button" className="btn btn-outline-primary" onClick={openDialog} disabled={isLoading}>
            {(!isLoading && !instance.loading) && "Disponibilizar Resultados"}
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
      <ConfirmDialog open={confirmDialogOpen} actionButtonText="Disponibilizar" title="Disponibilizar Resultados" text="Ao disponibilizar os resultados todos os inscritos teram acesso a ele, em seguida você também poderá gerar uma postagem pública. Deseja prosseguir?" onClose={clseDialog} onConfirm={disponibilizarResultado} />

    </>
  )

}