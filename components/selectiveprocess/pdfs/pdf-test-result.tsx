import React, { useEffect, useState } from 'react';
import ReactPDF, { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Font, usePDF, pdf } from '@react-pdf/renderer';
import { ProcessStep, ProcessStepsTypes, SelectiveProcess } from '../../../models/selective-process';
import PDFHeader from './components/pdf-header';
import PDFTable, { PDFTableInfo } from './components/pdf-table';
import { FinalListGroup } from '../dashboard/final-result';
import { Subscription } from '../../../models/subscription';
import SelectiveProcessUtil from '../../../lib/selectiveprocess.util';

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
    let subInfo: PDFTableInfo[] = [
      { value: sub.name, width: "30%", textAlign: "left" },
      { value: (isTest ? sub.testGrade || '-' : sub.interviewGrade || '-').toString() || "-", width: "20%", textAlign: "center" },
      { value: ((isTest && processUtil.hasPassedTest(sub, currentStep)) || (!isTest && !processUtil.hasPassedInterview(sub, currentStep))) ? "Desclassificado" : "Classificado", width: "20%", textAlign: "center" },
      { value: isTest ? sub.testObs : sub.interviewObs, width: "30%", textAlign: "left" },
    ];
    lines.push(subInfo);

    let resource = sub?.resources?.find(res => res.step == (isTest ? ProcessStepsTypes.INTERPOSICAO_RECURSO_PROVA : ProcessStepsTypes.INTERPOSICAO_RECURSO_ENTREVISTA));
    if (resource) {
      let resourceInfo: PDFTableInfo[] = [
        { value: sub.name, width: "30%", textAlign: "left" },
        { value: resource.status, width: "20%", textAlign: "center" },
        { value: resource.statusObservation, width: "50%", textAlign: "left" },
      ];
      resourceLines.push(resourceInfo);
    }
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