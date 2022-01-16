import React from 'react';
import { Page, Document, StyleSheet } from '@react-pdf/renderer';
import PDFHeader from './components/pdf-header';
import PDFTable, { PDFTableInfo } from './components/pdf-table';
import SelectiveProcessUtil from '../../../lib/selectiveprocess.util';
import { SelectiveProcess } from '../../../models/subscription-process/selective-process';
import { ProcessStep } from '../../../models/subscription-process/process-step';
import { Subscription } from '../../../models/subscription/subscription';
import { SubscriptionStatus } from '../../../models/subscription/subscription-resource.enum';
import { ProcessStepsTypes } from '../../../models/subscription-process/process-steps-types.enum';

interface Props {
  process: SelectiveProcess;
  currentStep: ProcessStep;
  subscriptionList: Subscription[];

}

export default function PDFBaremaResult(props: Props) {

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

  let baremaItens = [];
  let index = 1;
  if (process.baremaCategories) {
    for (let category of process.baremaCategories) {
      let subIndex = 1;
      for (let subCategory of category.subcategories) {
        baremaItens.push({
          item: "Item " + index + "." + subIndex,
          legend: subCategory.name,
          uuid: subCategory.uuid,
          pointFile: subCategory.points
        });
        subIndex++;
      }
      index++;
    }
  }
  const itensColSize = (85 / (baremaItens.length + 1)) + "%";
  //Headers
  let tableHeaders: PDFTableInfo[] = [
    { value: "Candidato(a)", width: "15%", textAlign: "left" },
  ];
  for (let item of baremaItens) {
    tableHeaders.push({
      value: item.item, width: itensColSize, textAlign: "center"
    })
  }
  tableHeaders.push({
    value: "Total", width: itensColSize, textAlign: "center"
  });

  //Legend Headers
  let legendTableHeaders: PDFTableInfo[] = [
    { value: "#", width: "15%", textAlign: "left" },
    { value: "Item", width: "85%", textAlign: "left" },
  ];

  //Resource Headers
  let resourceTableHeaders: PDFTableInfo[] = [
    { value: "Candidato(a)", width: "30%", textAlign: "left" },
    { value: "Parecer", width: "20%", textAlign: "center" },
    { value: "Observações", width: "50%", textAlign: "left" },
  ];

  let lines: PDFTableInfo[][] = [];
  let resourceLines: PDFTableInfo[][] = [];
  let legendLines: PDFTableInfo[][] = [];

  //Creating lines
  for (let sub of subscriptionList) {
    let totalPoints = 0;
    let subInfo: PDFTableInfo[] = [
      { value: sub.name, width: "15%", textAlign: "left" },
    ];
    for (let item of baremaItens) {
      let points: number = 0;
      if (sub.files) {
        let files = sub.files?.find(file => file.subcategoryID == item.uuid);
        if (files) {
          for (let file of files.files) {
            if (file.status == SubscriptionStatus.DEFERIDA) {
              points = points + +item.pointFile;
              totalPoints = totalPoints + +item.pointFile;
            }
          }
        }
      }
      subInfo.push({
        value: points.toString(), width: itensColSize, textAlign: "center"
      });
    }
    subInfo.push({
      value: totalPoints.toString(), width: itensColSize, textAlign: "center"
    })
    lines.push(subInfo);

    //Resources
    if (currentStep.type == ProcessStepsTypes.RESULTADO_DEFINITIVO_AVALIACAO_CURRICULAR) {
      let resource = sub?.resources?.find(res => res.step == ProcessStepsTypes.INTERPOSICAO_RECURSO_AVALIACAO_CURRICULAR);
      if (resource) {
        let resourceInfo: PDFTableInfo[] = [
          { value: sub.name, width: "30%", textAlign: "left" },
          { value: resource.status, width: "20%", textAlign: "center" },
          { value: resource.statusObservation, width: "50%", textAlign: "left" },
        ];
        resourceLines.push(resourceInfo);
      }
    }

  }

  //Legend Line
  for (let item of baremaItens) {
    let legendLine: PDFTableInfo[] = [
      { value: item.item, width: "15%", textAlign: "left" },
      { value: item.legend, width: "85%", textAlign: "left" },
    ];

    legendLines.push(legendLine)
  }

  // Create Document Component
  const PDF = () => (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <PDFHeader title={process.title} description={process.description} step={currentStep.type} logoW={"25%"} />
        <PDFTable title={""} headerList={tableHeaders} lines={lines} />
        <PDFTable title={"Legenda"} headerList={legendTableHeaders} lines={legendLines} marginTop={35} />
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