import { ErrorMessage, Field, Formik } from 'formik'
import React, { useEffect, useState } from "react";
import * as Yup from 'yup'
import { useRouter } from 'next/router';
import { APIRoutes } from '../../../utils/api.routes';
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import { ProcessStep, ProcessStepsState, ProcessStepsTypes, SelectiveProcess } from '../../../models/selective-process';
import { Subscription, SubscriptionStatus } from '../../../models/subscription';
import { faTrash, faClock, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { format } from 'date-fns';
import SelectiveProcessUtil from '../../../lib/selectiveprocess.util';

interface Props {
    process: SelectiveProcess;
    currentStep: ProcessStep;
    subscriptionList: Subscription[];
}

export default function SelectiveProcessSubscriptionGrading(props: Props) {

    const router = useRouter();
    const [subscriptionList, setSubscriptionList] = useState<Subscription[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [selectiveProcess, setSelectiveProcess] = useState<SelectiveProcess>({ title: '', state: ProcessStepsState.IN_CONSTRUCTION });
    const [currentStep, setCurrentStep] = useState<ProcessStep>({ type: ProcessStepsTypes.INSCRICAO, startDate: 0, finishDate: 0, passingScore: 0, weight: 0, order: 0 });

    const api = API(setLoading);
    const processUtil = SelectiveProcessUtil();

    useEffect(() => {
        setSelectiveProcess(props.process);
        setCurrentStep(props.currentStep);
        const list: Subscription[] = props.subscriptionList;
        const finalList: Subscription[] = [];

        for (let sub of list) {
            sub['formatedDate'] = format(new Date(sub.subscriptionDate), 'dd/MM/yyyy');
            if (sub.status == SubscriptionStatus.DEFERIDA) {
                finalList.push(sub)
            }
            if (sub.grades) {
                for (let grade of sub.grades) {
                    if (grade.step == props.currentStep.type) {
                        sub.currentGrade = grade;
                    }
                }
            } else {
                sub.grades = [];
            }

            if (!sub.currentGrade) {
                sub.currentGrade = { grade: 0, step: props.currentStep.type };
                sub.grades.push(sub.currentGrade);
            }

        }
        orderSubsList(finalList, props.process);

    }, []);

    const handleGradeChange = (index, evt) => {
        const newSubscriptionList = subscriptionList.map((sub, i) => {
            if (index !== i) return sub;
            sub.currentGrade.grade = +evt.target.value;
            return sub;
        });

        orderSubsList(newSubscriptionList, selectiveProcess);
    };

    const orderSubsList = (subList: Subscription[], process: SelectiveProcess) => {
        setSubscriptionList(processUtil.orderSubscriptionList(subList, process));
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
                                        <tr className={sub.currentGrade.grade < currentStep.passingScore ? 'table-danger' : ''}>
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
                                                    type="number"
                                                    className="form-control"
                                                    name={i + 'grade'}
                                                    id={i + 'grade'}
                                                    placeholder="Nota (0-100)"
                                                    value={sub.currentGrade.grade}
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

            <div className="row mt-3">
                <div className="col-12 text-center">
                    <button className="btn btn-success">Salvar Dados</button>
                </div>
            </div>


        </>
    );
}