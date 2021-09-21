import { ErrorMessage, Field, Formik } from 'formik'
import React, { useEffect, useState } from "react";
import * as Yup from 'yup'
import { useRouter } from 'next/router';
import { APIRoutes } from '../../../utils/api.routes';
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import { ProcessStep, ProcessStepsState, ProcessStepsTypes, SelectiveProcess } from '../../../models/selective-process';
import { Subscription, SubscriptionStatus } from '../../../models/subscription';
import { faSquare, faClock, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { format, isThisISOWeek } from 'date-fns';
import SelectiveProcessUtil from '../../../lib/selectiveprocess.util';
import style from '../../../styles/selectiveprocess.module.css'

interface Props {
    process: SelectiveProcess;
    currentStep: ProcessStep;
    subscriptionList: Subscription[];
    reservedPlacesMap: any;

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

                sub.interviewGrade = sub.interviewGrade | 0;
                sub.testGrade = sub.testGrade | 0;
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
            if (currentStep.type == ProcessStepsTypes.PROVA || currentStep.type == ProcessStepsTypes.INTERPOSICAO_RECURSO_PROVA) {
                sub.testGrade = +evt.target.value;
            } else if (currentStep.type == ProcessStepsTypes.ENTREVISTA || currentStep.type == ProcessStepsTypes.INTERPOSICAO_RECURSO_ENTREVISTA) {
                sub.interviewGrade = +evt.target.value;
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
            api.post(APIRoutes.SELECTIVE_PROCESS_SUBSCRIPTION_GRADING, { subscriptionList: subscriptionList });
        }
    }

    return (
        <>

            <div className="row">
                <div className="col-6">
                    <h5 className="text-primary-dark">Inscritos</h5>
                </div>
            </div>
            <div className="row mt-3">
                <div className="col-12 table-responsive">
                    <table className="table">
                        <caption>Quantidade de Inscritos: {subscriptionList.length}</caption>
                        <caption><FontAwesomeIcon icon={faSquare} className={style.colorTableDanger + " sm-icon me-1"} /> Desclassificados</caption>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Idade</th>
                                <th>Data de Inscrição</th>
                                <th>Vaga</th>
                                <th>Parecer</th>
                                <th>Pontuação (0-100)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptionList.map((sub, i) => {
                                return (
                                    <Link href={`/admin/subscription/${encodeURIComponent(sub.id)}?stepType=${currentStep.type}`} key={sub.id}>
                                        <tr className={
                                            (isTest && sub.testGrade < currentStep.passingScore) || (isInterview && sub.interviewGrade < currentStep.passingScore)
                                                ? 'table-danger' : ''}>
                                            <td>{sub.name}</td>
                                            <td>{sub.age}</td>
                                            <td>{sub['formatedDate']}</td>
                                            <td>{sub.reservedPlace}</td>
                                            <td>
                                                {sub.status == SubscriptionStatus.AGUARDANDO_ANALISE && <FontAwesomeIcon icon={faClock} className="sm-icon me-1" />}
                                                {sub.status == SubscriptionStatus.DEFERIDA && <FontAwesomeIcon icon={faCheck} className="sm-icon me-1" />}
                                                {sub.status == SubscriptionStatus.INDEFERIDA && <FontAwesomeIcon icon={faTimes} className="sm-icon me-1" />}
                                                {sub.status}
                                            </td>
                                            <td>
                                                <input
                                                    disabled={!canEdit}
                                                    type="number"
                                                    className="form-control"
                                                    name={i + 'grade'}
                                                    id={i + 'grade'}
                                                    placeholder="Nota (0-100)"
                                                    value={isTest ? sub.testGrade : sub.interviewGrade}
                                                    onClick={(e) => { e.preventDefault() }}
                                                    onChange={(e) => { handleGradeChange(i, e) }}>
                                                </input>


                                            </td>
                                        </tr>
                                    </Link>
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