import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { APIRoutes } from '../../../utils/api.routes';
import API from '../../../lib/api.service';
import { faSquare, faClock, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { format } from 'date-fns';
import SelectiveProcessUtil from '../../../lib/selectiveprocess.util';
import style from '../../../styles/selectiveprocess.module.css'
import PDFTestResult from '../pdfs/pdf-test-result';
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

export default function SelectiveProcessSubscriptionGrading(props: Props) {

    const router = useRouter();
    const [subscriptionList, setSubscriptionList] = useState<Subscription[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [canEdit, setCanEdit] = useState<boolean>(false);
    const [isInterview, setIsInterview] = useState<boolean>(false);
    const [isTest, setIsTest] = useState<boolean>(false);
    const [selectiveProcess, setSelectiveProcess] = useState<SelectiveProcess>({ title: '', state: ProcessStepsState.IN_CONSTRUCTION });
    const [currentStep, setCurrentStep] = useState<ProcessStep>({ type: ProcessStepsTypes.INSCRICAO, startDate: 0, finishDate: 0, passingScore: 0, weight: 0, order: 0 });

    const api = API(setLoading);
    const processUtil = SelectiveProcessUtil();

    useEffect(() => {
        setData();
    }, []);

    useEffect(() => {
        setData();
    }, [props]);

    const setData = () => {
        setSelectiveProcess(props.process);

        let propsCurrentStep = props.currentStep;
        if (propsCurrentStep.type == ProcessStepsTypes.INTERPOSICAO_RECURSO_ENTREVISTA
            || propsCurrentStep.type == ProcessStepsTypes.ENTREVISTA
            || propsCurrentStep.type == ProcessStepsTypes.RESULTADO_PRELIMINAR_ENTREVISTA
            || propsCurrentStep.type == ProcessStepsTypes.RESULTADO_DEFINITIVO_ENTREVISTA) {
            setIsInterview(true)
            let interviewStep = props.process.steps.find(step => step.type == ProcessStepsTypes.ENTREVISTA);
            propsCurrentStep.passingScore = interviewStep.passingScore;
        } else if (propsCurrentStep.type == ProcessStepsTypes.INTERPOSICAO_RECURSO_PROVA
            || propsCurrentStep.type == ProcessStepsTypes.RESULTADO_DEFINITIVO_PROVA
            || propsCurrentStep.type == ProcessStepsTypes.PROVA
            || propsCurrentStep.type == ProcessStepsTypes.RESULTADO_PRELIMINAR_PROVA) {
            setIsTest(true);
            let testStep = props.process.steps.find(step => step.type == ProcessStepsTypes.PROVA);
            propsCurrentStep.passingScore = testStep.passingScore;
        }

        setCurrentStep(propsCurrentStep);
        const list: Subscription[] = props.subscriptionList;
        const finalList: Subscription[] = [];

        for (let sub of list) {
            sub['formatedDate'] = format(new Date(sub.subscriptionDate), 'dd/MM/yyyy');
            if (sub.status == SubscriptionStatus.DEFERIDA) {
                processUtil.setSubscriptionPlaceName(sub, props.process);
                finalList.push(sub)
            }

        }
        orderSubsList(finalList, props.process);

        setCanEdit(props.currentStep.type == ProcessStepsTypes.PROVA || props.currentStep.type == ProcessStepsTypes.ENTREVISTA
            || props.currentStep.type == ProcessStepsTypes.INTERPOSICAO_RECURSO_ENTREVISTA || props.currentStep.type == ProcessStepsTypes.INTERPOSICAO_RECURSO_PROVA);
    }

    const handleGradeChange = (index, evt) => {
        const newSubscriptionList = subscriptionList.map((sub, i) => {
            if (index !== i) return sub;
            if (isTest) {
                sub.testGrade = evt.target.value.length > 0 ? +evt.target.value : undefined;
            } else if (isInterview) {
                sub.interviewGrade = evt.target.value.length > 0 ? +evt.target.value : undefined;
            }
            return sub;
        });

        orderSubsList(newSubscriptionList, selectiveProcess);
    };

    const handleObservationChange = (index, evt) => {
        const newSubscriptionList = subscriptionList.map((sub, i) => {
            if (index !== i) return sub;
            if (isTest) {
                sub.testObs = evt.target.value;
            } else if (isInterview) {
                sub.interviewObs = evt.target.value;
            }
            return sub;
        });

        orderSubsList(newSubscriptionList, selectiveProcess);
    };

    const orderSubsList = (subList: Subscription[], process: SelectiveProcess) => {
        setSubscriptionList(processUtil.orderSubscriptionListByTests(subList, process));
    }

    const saveGradings = () => {
        if (!isLoading) {
            let subList = [];
            for (let subscription of subscriptionList) {
                let sub = {};
                sub['id'] = subscription.id
                if (isTest) {
                    sub['testGrade'] = subscription.testGrade;
                    sub['testObs'] = subscription.testObs;
                } else if (isInterview) {
                    sub['interviewGrade'] = subscription.interviewGrade;
                    sub['interviewObs'] = subscription.interviewObs;
                }
                subList.push(sub);
            }
            api.post(APIRoutes.SELECTIVE_PROCESS_SUBSCRIPTION_GRADING, { subscriptionList: subList, isInterview, isTest });
        }
    }
    const PDF = PDFTestResult({ process: selectiveProcess, currentStep: currentStep, subscriptionList: subscriptionList, isTest });



    return (
        <>

            <div className="row">
                <div className="col-6">
                    <h5 className="text-primary-dark">Candidatos {currentStep.type}</h5>
                </div>
                {!canEdit && <div className="col-6 text-right">
                    <PDFButtons process={selectiveProcess} currentStep={currentStep} document={PDF()}  subscriptionList={subscriptionList} setBaseProcess={props.setBaseProcess}></PDFButtons>
                </div>}
            </div>
            <div className="row mt-3">
                <div className="col-12 table-responsive">
                    <table className="table">
                        <caption>Quantidade de Inscritos: {subscriptionList.length}</caption>
                        <caption>Nota de Corte: {currentStep.passingScore}</caption>
                        <caption><FontAwesomeIcon icon={faSquare} className={style.colorTableDanger + " sm-icon me-1"} /> Desclassificados</caption>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Vaga</th>
                                <th>Parecer</th>
                                <th>Pontuação (0-100)</th>
                                <th>Observações</th>
                                <th>Ver Dados</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptionList.map((sub, i) => {
                                return (

                                    <tr  key={sub.id} className={
                                        (isTest && !processUtil.hasPassedTest(sub, currentStep)) || (isInterview && !processUtil.hasPassedInterview(sub, currentStep))
                                            ? 'table-danger' : ''}>
                                        <td className="align-middle">{sub.name}</td>
                                        <td className="align-middle">{sub.placeName}</td>
                                        <td className="align-middle">
                                            {sub.status == SubscriptionStatus.AGUARDANDO_ANALISE && <FontAwesomeIcon icon={faClock} className="sm-icon me-1" />}
                                            {sub.status == SubscriptionStatus.DEFERIDA && <FontAwesomeIcon icon={faCheck} className="sm-icon me-1" />}
                                            {sub.status == SubscriptionStatus.INDEFERIDA && <FontAwesomeIcon icon={faTimes} className="sm-icon me-1" />}
                                            {sub.status}
                                        </td>
                                        <td className="align-middle">
                                            <input
                                                disabled={!canEdit}
                                                type="number"
                                                className="form-control form-control-sm"
                                                name={i + 'grade'}
                                                id={i + 'grade'}
                                                placeholder="-"
                                                value={(isTest ? sub.testGrade : sub.interviewGrade) != undefined ? (isTest ? sub.testGrade : sub.interviewGrade) : ""}
                                                onClick={(e) => { e.preventDefault() }}
                                                onChange={(e) => { handleGradeChange(i, e) }}>
                                            </input>
                                        </td>
                                        <td className="align-middle">
                                            <input
                                                disabled={!canEdit}
                                                type="text"
                                                className="form-control form-control-sm"
                                                name={i + 'obs'}
                                                id={i + 'obs'}
                                                placeholder=""
                                                value={isTest ? sub.testObs : sub.interviewObs}
                                                onClick={(e) => { e.preventDefault() }}
                                                onChange={(e) => { handleObservationChange(i, e) }}>
                                            </input>
                                        </td>
                                        <td className="align-middle">
                                            <Link href={`/admin/subscription/${encodeURIComponent(sub.id)}?stepType=${currentStep.type}`} >
                                               <b className="link-primary cursor-pointer"> Acessar</b>
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}

                        </tbody>
                    </table>
                    {(subscriptionList.length == 0 && !isLoading) &&
                        <div className="alert alert-info mt-3 text-center">
                            Nenhum resultado encontrado.
                        </div>
                    }

                </div>
            </div>
            {canEdit &&
                <div className="row mt-3">
                    <div className="col-12 text-center">
                        <button className="btn btn-success" onClick={saveGradings}>Salvar Dados</button>
                    </div>
                </div>
            }



        </>
    );
}