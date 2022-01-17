import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { APIRoutes } from '../../../utils/api.routes';
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import style from '../../../styles/subscription.module.css';
import { Subscription } from "../../../models/subscription/subscription";
import { SelectiveProcess } from "../../../models/subscription-process/selective-process";
import { ProcessStepsTypes } from "../../../models/subscription-process/process-steps-types.enum";
import { SubscriptionStatus } from "../../../models/subscription/subscription-resource.enum";
import { SubscriptionResource } from "../../../models/subscription/subscription-resource";

interface Props {
    subscription: Subscription;
    process: SelectiveProcess;
    stepType: ProcessStepsTypes;
}


export default function SelectiveResourcesAnalysis(props: Props) {

    const router = useRouter();
    const [subscription, setSubscription] = useState<Subscription>({
        name: "", age: 0, protocol: "", reservedPlace: "", status: SubscriptionStatus.AGUARDANDO_ANALISE, selectiveProcessID: "", id: "", graduationProofFile: "", subscriptionDate: "0"
    });
    const [resources, setResources] = useState<SubscriptionResource[]>([]);
    const [stepType, setStepType] = useState<ProcessStepsTypes>(ProcessStepsTypes.INSCRICAO);

    const [isLoading, setLoading] = useState<boolean>(true);


    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const api = API(setLoading);


    useEffect(() => {
        const process = props.process;
        const sub = props.subscription;

        setStepType(props.stepType);
        setSubscription(sub);
        setResources(sub.resources ?? []);

    }, []);

    const saveResourceInfo = async (status: SubscriptionStatus) => {
        try {
            for (let resource of subscription.resources) {
                if (resource.step == stepType
                    || resource.step == ProcessStepsTypes.INTERPOSICAO_RECURSO_INSCRICAO && stepType == ProcessStepsTypes.HOMOLOGACAO_DEFINITIVA_INSCRICAO) {

                    resource.status = status;
                    resource.statusObservation = subscription.currentResource.statusObservation;

                    if (subscription.status == SubscriptionStatus.INDEFERIDA && resource.status == SubscriptionStatus.DEFERIDA && resource.step == ProcessStepsTypes.INTERPOSICAO_RECURSO_INSCRICAO) {
                        subscription.status = status;
                    }
                }
            }
            subscription.currentResource = undefined;
            const response: APIResponse = await api.post(APIRoutes.SELECTIVE_PROCESS_SUBSCRIPTION, subscription);
            const sub: Subscription = response.result;
            setSubscription(sub);

        } catch (error) {
            console.error(error);
        }
    }


    const handleResouceStatusObsChange = (e) => {
        setSubscription({ ...subscription, currentResource: { ...subscription.currentResource, statusObservation: e.target.value } });
    }
    return (
        <>

            {
                subscription.currentResource &&
                <>
                    <fieldset className="mt-5">
                        <legend>{stepType}</legend>
                        <div className="row justify-content-center mt-5">
                            <div className="col-12">
                                <div className="mb-3">
                                    <label className="form-label">Justificativa:</label>
                                    <textarea className="form-control" readOnly disabled={true} id="justification" name="justification" rows={4} value={subscription.currentResource.justification} ></textarea>
                                </div>
                            </div>

                            <div className="col-12">
                                <div className="mb-3">
                                    <label className="form-label">Anexos do Recurso:</label>
                                    <div>
                                        {subscription.currentResource.files?.map((file, i) => (
                                            <a href={file} className={style.titleFileForm} target="_blank">
                                                <FontAwesomeIcon icon={faFile} className={style.iconFileForm}/> Arquivo {i+1} 
                                                <br />
                                            </a>
                                            
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="mb-3">
                                    <label className="form-label">Parecer do recurso</label>
                                    <textarea className="form-control" id="obs" name="obs" rows={3} value={subscription.currentResource.statusObservation} onChange={handleResouceStatusObsChange}></textarea>
                                </div>
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-primary" onClick={(e) => saveResourceInfo(SubscriptionStatus.DEFERIDA)}>Deferir</button>
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-danger" onClick={(e) => saveResourceInfo(SubscriptionStatus.INDEFERIDA)}>Indeferir</button>
                            </div>
                        </div>
                    </fieldset>


                </>
            }
            <fieldset className="mt-5">
                <legend>Lista de recursos enviados</legend>
                <div className="row mt-4">
                    <div className="col-12 table-responsive">
                        <table className="table table-striped ">
                            <thead>
                                <tr>
                                    <th>Etapa</th>
                                    <th>Parecer</th>
                                    <th>Motivo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resources.map((resource, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>
                                                {resource.step}
                                            </td>
                                            <td> {resource.status}  </td>
                                            <td>  {resource.statusObservation || "-"}  </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </fieldset>
        </>
    );
}