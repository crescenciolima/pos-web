import React, { useEffect, useState } from 'react'

import AdminBase from '../../../components/admin/admin-base'
import { APIRoutes } from '../../../utils/api.routes'
import { News } from '../../../models/news';
import { useRouter } from 'next/router'
import Link from 'next/link';
import * as Yup from 'yup'
import { ErrorMessage, Formik } from 'formik'
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import fire from '../../../utils/firebase-util';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import { Subscription, SubscriptionStatus } from '../../../models/subscription';
import { faClock, faFile, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ProcessStepsTypes } from '../../../models/selective-process';
import { format } from 'date-fns';

export default function ProcessSubscriprionLayout() {

    const router = useRouter();
    const api = API();

    const [subscription, setSubscription] = useState<Subscription>({
        name: "", age: 0, protocol: "", reservedPlace: "", status: SubscriptionStatus.AGUARDANDO_ANALISE, selectiveProcessID: "", id: "", graduationProofFile: "", subscriptionDate: 0
    });
    const [stepType, setStepType] = useState<ProcessStepsTypes>(ProcessStepsTypes.INSCRICAO);

    useEffect(() => {

        const { id, stepType } = router.query;
        if (id) {
            let type = ProcessStepsTypes.INSCRICAO;
            for (let key in ProcessStepsTypes) {
                if (stepType.toString() == ProcessStepsTypes[key].toString()) {
                    type = ProcessStepsTypes[key];
                }
            }
            getSubscriprion(id.toString(), type);
            setStepType(type);
        }

    }, [router.query]);

    const getSubscriprion = async (id: string, type: ProcessStepsTypes) => {
        //Recupera o valor do banco de dados
        const response: APIResponse = await api.get(APIRoutes.SUBSCRIPTION, { 'id': id });
        const sub: Subscription = response.result;

        if (sub.resources?.length > 0) {
            for (let resource of sub.resources) {
                if (resource.step == type
                    || resource.step == ProcessStepsTypes.RECURSO_INSCRICAO && type == ProcessStepsTypes.HOMOLOGACAO_DEFINITIVA_INSCRICAO) {

                    resource.formatedDate = format(new Date(resource.date), 'dd/MM/yyyy');
                    sub.currentResource = resource;
                }
            }
        }

        setSubscription(sub);
    }



    const save = async (status: SubscriptionStatus) => {
        try {

            subscription.status = status;

            const response: APIResponse = await api.post(APIRoutes.SUBSCRIPTION, subscription);
            const sub: Subscription = response.result;
            setSubscription(sub);

        } catch (error) {
            console.error(error);
        }
    }

    const saveResourceInfo = async (status: SubscriptionStatus) => {
        try {
            for (let resource of subscription.resources) {
                if (resource.step == stepType
                    || resource.step == ProcessStepsTypes.RECURSO_INSCRICAO && stepType == ProcessStepsTypes.HOMOLOGACAO_DEFINITIVA_INSCRICAO) {

                    resource.status = status;
                    resource.statusObservation = subscription.currentResource.statusObservation;

                    if (subscription.status == SubscriptionStatus.INDEFERIDA && resource.status == SubscriptionStatus.DEFERIDA && resource.step == ProcessStepsTypes.RECURSO_INSCRICAO) {
                        subscription.status = status;
                    }
                }
            }
            subscription.currentResource = undefined;
            const response: APIResponse = await api.post(APIRoutes.SUBSCRIPTION, subscription);
            const sub: Subscription = response.result;
            setSubscription(sub);

        } catch (error) {
            console.error(error);
        }
    }



    const handleStatusObsChange = (e) => {
        setSubscription({ ...subscription, statusObservation: e.target.value });
    }

    const handleResouceStatusObsChange = (e) => {
        setSubscription({ ...subscription, currentResource: { ...subscription.currentResource, statusObservation: e.target.value } });
    }

    return (
        <AdminBase>
            <div className="row mb-3">
                <div className="col-12 text-right">
                    <Link href="/admin">
                        <a className="link-primary ">Voltar</a>
                    </Link>
                </div>
            </div>
            <fieldset>
                <legend>
                    Inscrição: 
                    {subscription.status == SubscriptionStatus.AGUARDANDO_ANALISE && <FontAwesomeIcon icon={faClock} className="sm-icon mx-2" />}
                    {subscription.status == SubscriptionStatus.DEFERIDA && <FontAwesomeIcon icon={faCheck} className="sm-icon mx-2" />}
                    {subscription.status == SubscriptionStatus.INDEFERIDA && <FontAwesomeIcon icon={faTimes} className="sm-icon mx-2" />}
                    {subscription.status}
                </legend>
            </fieldset>
            {/* <div className="row">
                <div className="col-6">
                    <h5 className="text-primary-dark">
                        Inscrição
                        {subscription.status == SubscriptionStatus.AGUARDANDO_ANALISE && <FontAwesomeIcon icon={faClock} className="sm-icon mx-2" />}
                        {subscription.status == SubscriptionStatus.DEFERIDA && <FontAwesomeIcon icon={faCheck} className="sm-icon mx-2" />}
                        {subscription.status == SubscriptionStatus.INDEFERIDA && <FontAwesomeIcon icon={faTimes} className="sm-icon mx-2" />}
                        {subscription.status}
                    </h5>
                </div>
            </div> */}
            <div className="row mt-3">
                <div className="col-12 ">
                    <fieldset disabled>
                        <legend>Dados básicos</legend>
                        <div className="mb-3">
                            <label className="form-label">Nome</label>
                            <input type="text" id="nome" className="form-control form-control-sm" value={subscription.name} readOnly></input>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Idade</label>
                            <input type="text" id="idade" className="form-control form-control-sm" value={subscription.age} readOnly></input>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Vaga Selecionada</label>
                            <input type="text" id="vaga" className="form-control form-control-sm" value={subscription.reservedPlace} readOnly></input>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Infomações Adicionais</label>
                            <textarea className="form-control" id="obs" rows={3} readOnly value={subscription.observation}></textarea>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Comprovante de Graduação</label>
                            <a target="blank" href={subscription.graduationProofFile} className="link-primary">
                                <b><FontAwesomeIcon icon={faFile} className="sm-icon mx-1" />Arquivo </b>
                            </a>
                        </div>
                    </fieldset>
                </div>
            </div>
            {subscription.currentResource &&
                <>
                    <div className="row justify-content-center">
                        <div className="col-12 my-4 "><hr></hr></div>
                        <div className="col-12 text-center my-3">
                            <b>{stepType}</b>
                        </div>
                        <div className="col-12">
                            <div className="mb-3">
                                <label className="form-label">Justificativa:</label>
                                <textarea className="form-control" readOnly disabled={true} id="justification" name="justification" rows={4} value={subscription.currentResource.justification} ></textarea>
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
                </>}
            {
                (stepType == ProcessStepsTypes.INSCRICAO || stepType == ProcessStepsTypes.HOMOLOGACAO_PRELIMINAR_INSCRICAO) &&
                <fieldset>
                    <legend>Parecer Inscrição</legend>
                    <div className="row justify-content-center">
                    <div className="col-12">
                        <div className="mb-3">
                            <label className="form-label">Infomações Adicionais da Análise (Parecer)</label>
                            <textarea className="form-control" id="obs" name="obs" rows={3} value={subscription.statusObservation} onChange={handleStatusObsChange}></textarea>
                        </div>
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-primary" onClick={(e) => save(SubscriptionStatus.DEFERIDA)}>Deferir</button>
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-danger" onClick={(e) => save(SubscriptionStatus.INDEFERIDA)}>Indeferir</button>
                    </div>
                </div>
                </fieldset>
            
            }

        </AdminBase>
    )
}

