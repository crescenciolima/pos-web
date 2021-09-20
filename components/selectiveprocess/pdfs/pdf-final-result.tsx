import React from 'react';
import ReactPDF, { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';
import { ProcessStep, SelectiveProcess } from '../../../models/selective-process';
import PDFHeader from './components/pdf-header';
import PDFTable, { PDFTableInfo } from './components/pdf-table';
import { FinalListGroup } from '../dashboard/final-result';

// Create styles


interface Props {
  process: SelectiveProcess;
  currentStep: ProcessStep;
  groupList: FinalListGroup[];
  barema: ProcessStep;
  test: ProcessStep;
  interview: ProcessStep;
}

export default function PDFFinalResult(props: Props) {

  const { process, currentStep, groupList, barema, test, interview } = props;

  // Font.register({
  //   family: 'Poppins',
  //   fonts: [
  //     {
  //       src: `https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap`
  //     },
  //   ]
  // })

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff'
    },
  });

  //Headers
  let tableHeaders: PDFTableInfo[] = [
    { value: "Nº", width: "10%" },
    { value: "Candidato(a)", width: "30%" },
  ];
  const resultWidth = (60 / ((test ? 1 : 0) + (interview ? 1 : 0) + (barema ? 1 : 0))) + "%"
  if (test) {
    tableHeaders.push({ value: "Pontuação da \nAvaliação (Peso " + test.weight + ")", width: resultWidth });
  }
  if (interview) {
    tableHeaders.push({ value: "Pontuação da \nEntrevista (Peso " + interview.weight + ")", width: resultWidth });
  }
  if (barema) {
    tableHeaders.push({ value: "Pontuação do \nCurrículo (Peso " + barema.weight + ")", width: resultWidth });
  }
  tableHeaders.push({ value: "Pontuação Final", width: resultWidth });


  let groupLines : PDFTableInfo[][][] = []

  for( let group of groupList){

    let lines:PDFTableInfo[][] = [];
    let index = 1;
    for(let sub of group.subscriptionList){
      let subInfo:PDFTableInfo[] = [
        {value:index+"", width:"10%"},
        {value:sub.name, width:"30%"},
      ];
      if (test) {
        subInfo.push({ value: sub.testGrade+ "", width: resultWidth });
      }
      if (interview) {
        subInfo.push({ value: sub.interviewGrade+"", width: resultWidth });
      }
      if (barema) {
        subInfo.push({ value: sub['baremaGrade'], width: resultWidth });
      }
      subInfo.push({ value: sub['finalGrade'], width: resultWidth });
      index++;
      lines.push(subInfo);
    }
    groupLines.push(lines);
  }

  // Create Document Component
  const MyDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader title={process.title} description={process.description} step={currentStep.type} />
        {groupList.map((group, indexGroup) => {
          return (
            <PDFTable title={group.name} headerList={tableHeaders} key={indexGroup} lines={groupLines[indexGroup]} />
          )
        })}


      </Page>
    </Document>
  );

  return (<PDFDownloadLink
    document={MyDocument()}
    fileName="movielist.pdf"
    style={{
      textDecoration: "none",
      padding: "10px",
      color: "#4a4a4a",
      backgroundColor: "#ffffff",
      border: "1px solid #4a4a4a"
    }}
  >
    {({ blob, url, loading, error }) =>
      loading ? "Loading document..." : "Download Pdf"
    }
  </PDFDownloadLink>
  )


}