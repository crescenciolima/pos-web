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

}

export default function PDFSubscriptionResult(props: Props) {

  const { process, currentStep, subscriptionList } = props;
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
    { value: "Candidato(a)", width: "25%", textAlign: "left" },
    { value: "Vaga", width: "30%", textAlign: "center" },
    { value: "Parecer", width: "15%", textAlign: "center" },
    { value: "Observações", width: "30%", textAlign: "left" },
  ];
  let resourceTableHeaders: PDFTableInfo[] = [
    { value: "Candidato(a)", width: "30%", textAlign: "left" },
    { value: "Parecer", width: "20%", textAlign: "center" },
    { value: "Observações", width: "50%", textAlign: "left" },
  ];

  let lines: PDFTableInfo[][] = [];
  let resourceLines: PDFTableInfo[][] = [];

  for (let sub of subscriptionList) {
    let subInfo: PDFTableInfo[] = [
      { value: sub.name, width: "25%", textAlign: "left" },
      { value: sub.placeName, width: "30%", textAlign: "center" },
      { value: sub.status, width: "15%", textAlign: "center" },
      { value: sub.statusObservation, width: "30%", textAlign: "left" },
    ];
    lines.push(subInfo);

    let resource = sub?.resources?.find(res => res.step == ProcessStepsTypes.INTERPOSICAO_RECURSO_INSCRICAO);
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