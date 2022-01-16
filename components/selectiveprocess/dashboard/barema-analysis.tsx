import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import API from '../../../lib/api.service';
import { faClock, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { format } from 'date-fns';
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

}

export default function SelectiveBaremaAnalysisList(props: Props) {

    const router = useRouter();
    const [subscriptionList, setSubscriptionList] = useState<Subscription[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [allChecked, setAllChecked] = useState<boolean>(false);
    const [selectiveProcess, setSelectiveProcess] = useState<SelectiveProcess>({ title: '', state: ProcessStepsState.IN_CONSTRUCTION });
    const [currentStep, setCurrentStep] = useState<ProcessStep>({ type: ProcessStepsTypes.INSCRICAO, startDate: 0, finishDate: 0, passingScore: 0, weight: 0, order: 0 });
    const [reservedPlacesMap, setReservedPlacesMap] = useState<any>({});

    const api = API(setLoading);


    useEffect(() => {
        setSelectiveProcess(props.process);
        setCurrentStep(props.currentStep);
        setReservedPlacesMap(props.reservedPlacesMap);
        const list: Subscription[] = props.subscriptionList;
        const finalList: Subscription[] = [];
        for (let sub of list) {
            if (sub.status == SubscriptionStatus.DEFERIDA) {
                sub['formatedDate'] = format(new Date(sub.subscriptionDate), 'dd/MM/yyyy');
                //
                let aproved = true;
                let testStep = props.process.steps.find(step => step.type == ProcessStepsTypes.PROVA);
                let interviewStep = props.process.steps.find(step => step.type == ProcessStepsTypes.ENTREVISTA);

                if (testStep) {
                    if (testStep.passingScore > sub.testGrade) {
                        aproved = false;
                    }
                }

                if (interviewStep) {
                    if (interviewStep.passingScore > sub.interviewGrade) {
                        aproved = false;
                    }
                }

                if(aproved){

                    let baremaChecked = true;
                    if(sub.files){
                        for (let baremaCategory of sub.files) {
                            if(baremaCategory.files){
                                for(let file of baremaCategory.files){
                                  if(file.status == SubscriptionStatus.AGUARDANDO_ANALISE){
                                    baremaChecked = false;
                                    break;
                                  }
                                }
                               
                            }
                        }
                    }
                  
                    sub['baremaChecked'] = baremaChecked;
                    finalList.push(sub);
                 }


                
            }
        }
        setSubscriptionList(finalList);

    }, []);



    return (
        <>

            <div className="row">
                <div className="col-6">
                    <h5 className="text-primary-dark">Inscritos</h5>
                </div>
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
                                <th>Análise do Barema</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptionList.map((sub, i) => {
                                return (
                                    <Link href={`/admin/subscription/${encodeURIComponent(sub.id)}?stepType=${currentStep.type}`} key={sub.id}>
                                        <tr>
                                            <td>{sub.name}</td>
                                            <td>{sub['formatedDate']}</td>
                                            <td>{reservedPlacesMap[sub.reservedPlace] || "Ampla Concorrência"}</td>
                                            <td>
                                                {sub['baremaChecked'] ?
                                                <><FontAwesomeIcon icon={faCheck} className="sm-icon me-1" /> Finalizada</> : 
                                                <><FontAwesomeIcon icon={faClock} className="sm-icon me-1" /> Aguardando Análise</> 
                                                }
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