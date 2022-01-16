import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import API from '../../../lib/api.service';
import Link from 'next/link';
import { format } from 'date-fns';
import SelectiveProcessUtil from '../../../lib/selectiveprocess.util';
import PDFButtons from '../pdfs/pdf-buttons';
import PDFBaremaResult from '../pdfs/pdf-barema-result';
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

export default function SelectiveBaremaResults(props: Props) {

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
        const finalList: Subscription[] = [];

        for (let sub of list) {
            if (sub.status == SubscriptionStatus.DEFERIDA) {
                sub['formatedDate'] = format(new Date(sub.subscriptionDate), 'dd/MM/yyyy');
                processUtil.setSubscriptionPlaceName(sub, props.process);
                let aproved = processUtil.isSubscriberApproved(sub, props.process, true);
                if (aproved) {
                    sub['baremaGrade'] = processUtil.calculateBaremaGrade(sub, props.process);
                    finalList.push(sub);
                }

            }
        }

        finalList.sort((a, b) => b['baremaGrade'] - a['baremaGrade']);
        setSubscriptionList(finalList);

    }, []);

    const PDF =  PDFBaremaResult({ process: selectiveProcess, currentStep: currentStep, subscriptionList: subscriptionList });


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
                                <th>Pontuação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptionList.map((sub, i) => {
                                return (
                                    <Link href={`/admin/subscription/${encodeURIComponent(sub.id)}?stepType=${currentStep.type}`} key={sub.id}>
                                        <tr>
                                            <td>{sub.name}</td>
                                            <td>{sub['formatedDate']}</td>
                                            <td>{sub.placeName}</td>
                                            <td>{sub['baremaGrade']}</td>
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