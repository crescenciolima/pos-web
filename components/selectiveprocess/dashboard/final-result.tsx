import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import API from '../../../lib/api.service';
import Link from 'next/link';
import { format } from 'date-fns';
import SelectiveProcessUtil from '../../../lib/selectiveprocess.util';
import PDFFinalResult from '../pdfs/pdf-final-result';
import PDFButtons from '../pdfs/pdf-buttons';
import { SelectiveProcess } from "../../../models/subscription-process/selective-process";
import { ProcessStep } from "../../../models/subscription-process/process-step";
import { Subscription } from "../../../models/subscription/subscription";
import { ProcessStepsState } from "../../../models/subscription-process/process-steps-state.enum";
import { ProcessStepsTypes } from "../../../models/subscription-process/process-steps-types.enum";
import { SubscriptionStatus } from "../../../models/subscription/subscription-resource.enum";

interface Props {
    process: SelectiveProcess;
    currentStep: ProcessStep;
    subscriptionList: Subscription[];
    reservedPlacesMap: any;
    setBaseProcess:Function;

}

export interface FinalListGroup {
    name: string;
    numberPlaces: number;
    uuid: string;
    subscriptionList: Subscription[];
    
}

export default function SelectiveProcessFinalResult(props: Props) {

    const router = useRouter();
    // const [subscriptionList, setSubscriptionList] = useState<Subscription[]>([]);
    const [groupList, setGroupList] = useState<FinalListGroup[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [interview, setInterview] = useState<ProcessStep>();
    const [test, setTest] = useState<ProcessStep>();
    const [barema, setBarema] = useState<ProcessStep>();
    const [selectiveProcess, setSelectiveProcess] = useState<SelectiveProcess>({ title: '', state: ProcessStepsState.IN_CONSTRUCTION });

    const [currentStep, setCurrentStep] = useState<ProcessStep>({ type: ProcessStepsTypes.INSCRICAO, startDate: 0, finishDate: 0, passingScore: 0, weight: 0, order: 0 });

    const api = API(setLoading);
    const processUtil = SelectiveProcessUtil();


    useEffect(() => {
        const process = props.process
        const list: Subscription[] = props.subscriptionList;
        setCurrentStep(props.currentStep);
        let finalList: Subscription[] = [];

        setTest(process.steps.find(step => step.type == ProcessStepsTypes.PROVA));
        setInterview(process.steps.find(step => step.type == ProcessStepsTypes.ENTREVISTA));
        setBarema(process.steps.find(step => step.type == ProcessStepsTypes.AVALIACAO_CURRICULAR));
        setSelectiveProcess(process)

        //Filtrando a lista com somente quem não foi eliminado
        for (let sub of list) {
            if (sub.status == SubscriptionStatus.DEFERIDA) {
                sub['formatedDate'] = format(new Date(sub.subscriptionDate), 'dd/MM/yyyy')
                if (processUtil.isSubscriberApproved(sub, process)) {
                    sub['baremaGrade'] = processUtil.calculateBaremaGrade(sub, process);
                    sub['finalGrade'] = processUtil.calculateFinalGrade(sub, process);
                    finalList.push(sub);
                }
            }
        }

        //Ordenando a lista por nota
        finalList.sort((a, b) => b['finalGrade'] - a['finalGrade']);

        let groupList: FinalListGroup[] = [];
        let reservedPlaces: number = 0;

        //Vagas
        for (let place of process.reservedPlaces) {
            let placeGroup: FinalListGroup = {
                name: place.name,
                subscriptionList: [],
                numberPlaces: place.numberPlaces,
                uuid: place.uuid
            }
            reservedPlaces = reservedPlaces + +place.numberPlaces;
            groupList.push(placeGroup);
        }

        //Separando a lista pelas vagas
        let normalPlace: FinalListGroup = {
            name: "Ampla Concorrência",
            subscriptionList: finalList.filter(sub => sub.reservedPlace === null || sub.reservedPlace === ''),
            numberPlaces: process.numberPlaces - reservedPlaces,
            uuid: null
        }
        groupList.push(normalPlace);

        //Filtrando os inscritos
        for (let group of groupList) {
            for (let sub of finalList) {
                if (sub.reservedPlace && sub.reservedPlace == group.uuid) {
                    group.subscriptionList.push(sub);
                }
            }
        }
        groupList = groupList.filter(group => group.subscriptionList.length > 0);

        setGroupList(groupList);



    }, []);

    const PDF = PDFFinalResult({process: selectiveProcess, currentStep:currentStep, groupList:groupList, interview:interview, barema:barema, test:test})
    

    return (
        <>

            <div className="row">
                <div className="col-6">
                    <h5 className="text-primary-dark">Classificação Final</h5>
                </div>
                <div className="col-6 text-right">
                    <PDFButtons process={selectiveProcess} currentStep={currentStep} document={PDF()}  subscriptionList={[]} setBaseProcess={props.setBaseProcess}></PDFButtons>
                </div>
            </div>
            {groupList.map((group, indexGroup) => {
                return (
                    <div key={indexGroup} >

                        <div className="row mt-5">
                            <div className="col-12 text-center">
                                <h5>Classificação de candidados de {group.name}</h5>
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col-12 text-center table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nº</th>
                                            <th>Nome</th>
                                            {interview && <th>Nota da Entrevista (Peso {interview.weight})</th>}
                                            {test && <th>Nota da Prova (Peso {test.weight})</th>}
                                            {barema && <th>Nota Avaliação Curricular (Peso {barema.weight})</th>}
                                            <th>Nota Final</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.subscriptionList.map((sub, indexSub) => {
                                            return (
                                                <Link href={`/admin/subscription/${encodeURIComponent(sub.id)}?stepType=${currentStep.type}`} key={sub.id}>
                                                    <tr>
                                                        <td>Nº {indexSub + 1}</td>
                                                        <td>{sub.name}</td>
                                                        {interview && <td>{sub.interviewGrade}</td>}
                                                        {test && <td>{sub.testGrade}</td>}
                                                        {barema && <td>{sub['baremaGrade']}</td>}
                                                        <td>
                                                            {sub['finalGrade']}
                                                        </td>
                                                    </tr>
                                                </Link>
                                            )
                                        })}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            })}

           
        </>
    );
}