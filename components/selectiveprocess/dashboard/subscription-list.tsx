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
import PDFButtons from '../pdfs/pdf-buttons';
import PDFSubscriptionResult from '../pdfs/pdf-subscription-result';

interface Props {
    process: SelectiveProcess;
    currentStep: ProcessStep;
    subscriptionList: Subscription[];
    reservedPlacesMap: any;
}

export default function SelectiveProcessSubscriptionList(props: Props) {

    const router = useRouter();
    const [subscriptionList, setSubscriptionList] = useState<Subscription[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [allChecked, setAllChecked] = useState<boolean>(false);
    const [selectiveProcess, setSelectiveProcess] = useState<SelectiveProcess>({ title: '', state: ProcessStepsState.IN_CONSTRUCTION });
    const [currentStep, setCurrentStep] = useState<ProcessStep>({ type: ProcessStepsTypes.INSCRICAO, startDate: 0, finishDate: 0, passingScore: 0, weight: 0, order: 0 });

    const api = API(setLoading);
    const processUtil = SelectiveProcessUtil();


    useEffect(() => {
        setSelectiveProcess(props.process);
        setCurrentStep(props.currentStep);
        const list: Subscription[] = props.subscriptionList;

        let checked = true;
        for (let sub of list) {
            sub['formatedDate'] = format(new Date(sub.subscriptionDate), 'dd/MM/yyyy')
            processUtil.setSubscriptionPlaceName(sub, props.process);
            if (sub.status == SubscriptionStatus.AGUARDANDO_ANALISE) {
                checked = false;
            }
        }
        setAllChecked(checked);
        setSubscriptionList(list);

    }, []);

    const PDF =  PDFSubscriptionResult({ process: selectiveProcess, currentStep: currentStep, subscriptionList: subscriptionList });

    return (
        <>
            <div className="row">
                <div className="col-6">
                    <h5 className="text-primary-dark">Inscritos</h5>
                </div>
                {currentStep.type != ProcessStepsTypes.INSCRICAO && <div className="col-6 text-right">
                    <PDFButtons process={selectiveProcess} currentStep={currentStep} document={PDF()}></PDFButtons>
                </div>}
            </div>
            <div className="row mt-3">
                <div className="col-12 table-responsive">
                    <table className="table table-striped table-hover">
                        <caption>Quantidade de Inscritos: {subscriptionList.length}</caption>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Idade</th>
                                <th>Data de Inscrição</th>
                                <th>Vaga</th>
                                <th>Parecer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptionList.map((sub, i) => {
                                return (
                                    <Link href={`/admin/subscription/${encodeURIComponent(sub.id)}?stepType=${currentStep.type}`} key={sub.id}>
                                        <tr>
                                            <td>{sub.name}</td>
                                            <td>{sub.age}</td>
                                            <td>{sub['formatedDate']}</td>
                                            <td>{sub.placeName}</td>
                                            <td>
                                                {sub.status == SubscriptionStatus.AGUARDANDO_ANALISE && <FontAwesomeIcon icon={faClock} className="sm-icon me-1" />}
                                                {sub.status == SubscriptionStatus.DEFERIDA && <FontAwesomeIcon icon={faCheck} className="sm-icon me-1" />}
                                                {sub.status == SubscriptionStatus.INDEFERIDA && <FontAwesomeIcon icon={faTimes} className="sm-icon me-1" />}
                                                {sub.status}
                                            </td>
                                            {/* <td><button className="btn btn-sm btn-danger" onClick={(e) => removeTeacher(e, newsItem)} >
                                                <FontAwesomeIcon icon={faTrash} className="sm-icon" />
                                            </button></td> */}
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

            {(currentStep.type == ProcessStepsTypes.HOMOLOGACAO_PRELIMINAR_INSCRICAO)
                &&
                <div className="row mt-3">
                    <div className="col-12">
                        {allChecked &&
                            <div className="alert alert-success text-center">
                                Inscrições Homologadas com Sucesso.
                            </div>
                        }

                        {!allChecked &&
                            <div className="alert alert-warning text-center">
                                <b>Atenção: </b>Finalize a análise das inscrições até a data limite.
                            </div>
                        }
                    </div>
                </div>
            }

            {(currentStep.type == ProcessStepsTypes.HOMOLOGACAO_DEFINITIVA_INSCRICAO)
                &&
                <div className="row mt-3">
                    <div className="col-12">
                        <div className="alert alert-success text-center">
                            Homologação Definitiva Realizada com Sucesso.
                        </div>
                    </div>
                </div>
            }

        </>
    );
}