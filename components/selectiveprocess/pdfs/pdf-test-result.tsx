import React from 'react';
import { Page, Document, StyleSheet } from '@react-pdf/renderer';
import PDFHeader from './components/pdf-header';
import PDFTable, { PDFTableInfo } from './components/pdf-table';
import SelectiveProcessUtil from '../../../lib/selectiveprocess.util';
import { SelectiveProcess } from '../../../models/subscription-process/selective-process';
import { ProcessStep } from '../../../models/subscription-process/process-step';
import { Subscription } from '../../../models/subscription/subscription';
import { ProcessStepsTypes } from '../../../models/subscription-process/process-steps-types.enum';
import { SubscriptionStatus } from '../../../models/subscription/subscription-resource.enum';

interface Props {
  process: SelectiveProcess;
  currentStep: ProcessStep;
  subscriptionList: Subscription[];
  isTest: boolean;

}

export default function PDFTestResult(props: Props) {

  const { process, currentStep, subscriptionList, isTest } = props;
  const processUtil = SelectiveProcessUtil();


  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      padding: 20,
      fontFamily: 'Poppins'
    },
  });

  //Headers
  let tableHeaders: PDFTableInfo[] = [
    { value: "Candidato(a)", width: "30%", textAlign: "left" },
    { value: "Pontuação", width: "20%", textAlign: "center" },
    { value: "Situação", width: "20%", textAlign: "center" },
    { value: "Observações", width: "30%", textAlign: "left" },
  ];
  let resourceTableHeaders: PDFTableInfo[] = [
    { value: "Candidato(a)", width: "30%", textAlign: "left" },
    { value: "Parecer", width: "20%", textAlign: "center" },
    { value: "Observações", width: "50%", textAlign: "left" },
  ];

  let resourceLines: PDFTableInfo[][] = [];
  let lines: PDFTableInfo[][] = [];
  for (let sub of subscriptionList) {

    let resource = sub?.resources?.find(res => res.step == (isTest ? ProcessStepsTypes.INTERPOSICAO_RECURSO_PROVA : ProcessStepsTypes.INTERPOSICAO_RECURSO_ENTREVISTA));
    let observation = isTest ? sub.testObs : sub.interviewObs

    if (resource) {
      let resourceInfo: PDFTableInfo[] = [
        { value: sub.name, width: "30%", textAlign: "left" },
        { value: resource.status, width: "20%", textAlign: "center" },
        { value: resource.statusObservation, width: "50%", textAlign: "left" },
      ];
      resourceLines.push(resourceInfo);
      if (resource.status == SubscriptionStatus.DEFERIDA) {
        observation = resource.statusObservation;
      }
    }

    let subInfo: PDFTableInfo[] = [
      { value: sub.name, width: "30%", textAlign: "left" },
      { value: (isTest ? sub.testGrade || '-' : sub.interviewGrade || '-').toString() || "-", width: "20%", textAlign: "center" },
      { value: ((isTest && processUtil.hasPassedTest(sub, currentStep)) || (!isTest && processUtil.hasPassedInterview(sub, currentStep))) ? "Classificado" : "Desclassificado", width: "20%", textAlign: "center" },
      { value: observation, width: "30%", textAlign: "left" },
    ];
    lines.push(subInfo);



  }

  // Create Document Component
  const PDF = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader title={process.title} description={process.description} step={currentStep.type} />
        <PDFTable title={""} headerList={tableHeaders} lines={lines} />
      </Page>
      {resourceLines.length > 0 &&
        <Page size="A4" style={styles.page}>
          <PDFHeader title={process.title} description={process.description} step={"Resultado da Interposição dos Recursos"} />
          <PDFTable title={""} headerList={resourceTableHeaders} lines={resourceLines} />
        </Page>
      }
    </Document>
  );


  return (
    PDF
  )


}