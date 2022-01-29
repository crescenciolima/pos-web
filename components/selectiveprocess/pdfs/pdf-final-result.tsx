import React from 'react';
import { Page, Document, StyleSheet } from '@react-pdf/renderer';
import PDFHeader from './components/pdf-header';
import PDFTable, { PDFTableInfo } from './components/pdf-table';
import { FinalListGroup } from '../dashboard/final-result';
import { SelectiveProcess } from '../../../models/subscription-process/selective-process';
import { ProcessStep } from '../../../models/subscription-process/process-step';

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
    { value: "Nº", width: "10%", textAlign: "left" },
    { value: "Candidato(a)", width: "30%", textAlign: "left" },
  ];
  const resultWidth = (60 / ((test ? 1 : 0) + (interview ? 1 : 0) + (barema ? 1 : 0))) + "%"
  if (test) {
    tableHeaders.push({ value: "Pontuação da \nAvaliação (Peso " + test.weight + ")", width: resultWidth, textAlign: "center" });
  }
  if (interview) {
    tableHeaders.push({ value: "Pontuação da \nEntrevista (Peso " + interview.weight + ")", width: resultWidth, textAlign: "center" });
  }
  if (barema) {
    tableHeaders.push({ value: "Pontuação do \nCurrículo (Peso " + barema.weight + ")", width: resultWidth, textAlign: "center" });
  }
  tableHeaders.push({ value: "Pontuação Final", width: resultWidth, textAlign: "center" });


  let groupLines: PDFTableInfo[][][] = []

  for (let group of groupList) {

    let lines: PDFTableInfo[][] = [];
    let index = 1;
    for (let sub of group.subscriptionList) {
      let subInfo: PDFTableInfo[] = [
        { value: index + "", width: "10%", textAlign: "left" },
        { value: sub.name, width: "30%", textAlign: "left" },
      ];
      if (test) {
        subInfo.push({ value: sub.testGrade + "", width: resultWidth, textAlign: "center" });
      }
      if (interview) {
        subInfo.push({ value: sub.interviewGrade + "", width: resultWidth, textAlign: "center" });
      }
      if (barema) {
        subInfo.push({ value: sub['baremaGrade'], width: resultWidth, textAlign: "center" });
      }
      subInfo.push({ value: sub['finalGrade'], width: resultWidth, textAlign: "center" });
      index++;
      lines.push(subInfo);
    }
    groupLines.push(lines);
  }



  // Create Document Component
  const PDF = () => (
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


  return (
    PDF
  )


}