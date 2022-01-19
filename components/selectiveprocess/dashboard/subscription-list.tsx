import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import API from '../../../lib/api.service';
import { faClock, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { format } from 'date-fns';
import SelectiveProcessUtil from '../../../lib/selectiveprocess.util';
import PDFButtons from '../pdfs/pdf-buttons';
import PDFSubscriptionResult from '../pdfs/pdf-subscription-result';
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

export default function SelectiveProcessSubscriptionList(props: Props) {

    const router = useRouter();
    const [subscriptionList, setSubscriptionList] = useState<Subscription[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [allChecked, setAllChecked] = useState<boolean>(false);
    const [selectiveProcess, setSelectiveProcess] = useState<SelectiveProcess>({ title: '', state: ProcessStepsState.IN_CONSTRUCTION });
    const [currentStep, setCurrentStep] = useState<ProcessStep>({ type: ProcessStepsTypes.INSCRICAO, startDate: 0, finishDate: 0, passingScore: 0, weight: 0, order: 0 });

    const api = API(setLoading);
    const processUtil = SelectiveProcessUtil();
    const PDF =  PDFSubscriptionResult({ process: selectiveProcess, currentStep: currentStep, subscriptionList: subscriptionList });


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

    }, [props]);


    return (
        <>
            <div className="row">
                <div className="col-6">
                    <h5 className="text-primary-dark">Inscritos</h5>
                </div>
                {currentStep.type != ProcessStepsTypes.INSCRICAO && <div className="col-6 text-right">
                    <PDFButtons process={selectiveProcess} currentStep={currentStep} document={PDF()} subscriptionList={subscriptionList} setBaseProcess={props.setBaseProcess}></PDFButtons>
                </div>}
            </div>
            <div className="row mt-3">
                <div className="col-12 table-responsive">
                    <table className="table table-striped table-hover">
                        <caption>Quantidade de Inscritos: {subscriptionList.length}</caption>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Data de Inscrição</th>
                                <th>Vaga</th>
                                <th>Parecer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptionList.map((sub, i) => {
                                return (
                                    <Link href={`/admin/subscription/${encodeURIComponent(sub.id)}?stepType=${currentStep.type}`} key={sub.id}>
                                        <tr >
                                            <td>{sub.name}</td>
                                            <td>{sub['formatedDate']}</td>
                                            <td>{sub.placeName}</td>
                                            <td>
                                                {sub.status == SubscriptionStatus.AGUARDANDO_ANALISE && <FontAwesomeIcon icon={faClock} className="sm-icon me-1" />}
                                                {sub.status == SubscriptionStatus.DEFERIDA && <FontAwesomeIcon icon={faCheck} className="sm-icon me-1" />}
                                                {sub.status == SubscriptionStatus.INDEFERIDA && <FontAwesomeIcon icon={faTimes} className="sm-icon me-1" />}
                                                {sub.status}
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

        </>
    );
}