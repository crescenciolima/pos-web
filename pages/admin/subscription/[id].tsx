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
import { ProcessStepsState, ProcessStepsTypes, SelectiveProcess } from '../../../models/selective-process';
import { format } from 'date-fns';
import SelectiveBaremaAnalysis from '../../../components/selectiveprocess/subscription/subscription-barema-analysis';
import ImgThumbnail from '../../../components/selectiveprocess/dashboard/img-thumbnail';

export default function ProcessSubscriprionLayout() {

    const router = useRouter();
    const api = API();

    const [subscription, setSubscription] = useState<Subscription>({
        name: "", age: 0, protocol: "", reservedPlace: "", status: SubscriptionStatus.AGUARDANDO_ANALISE, selectiveProcessID: "", id: "", graduationProofFile: "", subscriptionDate: 0
    });

    const [stepType, setStepType] = useState<ProcessStepsTypes>(ProcessStepsTypes.INSCRICAO);
    const [menuSelection, setMenuSelection] = useState<string>("dadosbasicos");
    const [selectiveProcess, setSelectiveProcess] = useState<SelectiveProcess>({ title: '', state: ProcessStepsState.IN_CONSTRUCTION });

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
                    || resource.step == ProcessStepsTypes.INTERPOSICAO_RECURSO_INSCRICAO && type == ProcessStepsTypes.HOMOLOGACAO_DEFINITIVA_INSCRICAO) {

                    resource.formatedDate = format(new Date(resource.date), 'dd/MM/yyyy');
                    sub.currentResource = resource;
                }
            }
        }

        setSubscription(sub);

        getSelectiveProcess(sub.selectiveProcessID)
    }

    const getSelectiveProcess = async (id: string) => {
        const response: APIResponse = await api.get(APIRoutes.SELECTIVE_PROCESS, { 'id': id });
        const process: SelectiveProcess = response.result;

        setSelectiveProcess(process);
    }

    const save = async (status: SubscriptionStatus) => {
        try {

            subscription.status = status;

            const response: APIResponse = await api.post(APIRoutes.SELECTIVE_PROCESS_SUBSCRIPTION, subscription);
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

    const handleStatusObsChange = (e) => {
        setSubscription({ ...subscription, statusObservation: e.target.value });
    }

    const handleResouceStatusObsChange = (e) => {
        setSubscription({ ...subscription, currentResource: { ...subscription.currentResource, statusObservation: e.target.value } });
    }

    const checkSpecialTreatment = (specialTreatmentType) => {
        switch (specialTreatmentType) {
            case 'prova_braille': 
            return "Prova em Braille";
            break;
        case 'auxilio_leitor': 
            return "Auxílio de Leitor/Ledor";
            break;
        case 'interprete_libras': 
            return "Intérprete de Libras";
            break;
        case 'sala_mais_acesso': 
            return "Sala de Mais Acesso";
            break;
        case 'auxilio_transcricao': 
            return "Auxílio para Transcrição";
            break;
        case 'mesa_sem_braco': 
            return "Mesa e Cadeiras sem Braço";
            break;
        }
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
            <div className="row mt-5 justify-content-center">
                <div className="col-12">
                    <ul className="nav nav-tabs nav-fill">
                        <li className="nav-item">
                            <a className={'nav-link ' + (menuSelection == 'dadosbasicos' ? 'active' : '')} onClick={(e) => setMenuSelection('dadosbasicos')} aria-current="page" >Inscrição</a>
                        </li>
                        <li className="nav-item">
                            <a className={'nav-link ' + (menuSelection == 'barema' ? 'active' : '')} aria-disabled="true" onClick={(e) => setMenuSelection('barema')} >Barema</a>
                        </li>
                    </ul>
                </div>
            </div>
            {menuSelection == 'dadosbasicos'
                && <>
                    <fieldset className="mt-4">
                        <legend>
                            Inscrição:
                            {subscription.status == SubscriptionStatus.AGUARDANDO_ANALISE && <FontAwesomeIcon icon={faClock} className="sm-icon mx-2" />}
                            {subscription.status == SubscriptionStatus.DEFERIDA && <FontAwesomeIcon icon={faCheck} className="sm-icon mx-2" />}
                            {subscription.status == SubscriptionStatus.INDEFERIDA && <FontAwesomeIcon icon={faTimes} className="sm-icon mx-2" />}
                            {subscription.status}
                        </legend>
                    </fieldset>
                    <div className="row mt-3">
                        <div className="col-12 ">
                            <fieldset disabled>
                                <legend>Dados Pessoais</legend>
                                <div className="mb-3">
                                    <label className="form-label">Nome</label>
                                    <input type="text" id="nome" className="form-control form-control-sm" value={subscription.name} readOnly></input>
                                </div>
                               
                                <div className="mb-3">
                                    <label className="form-label">RG</label>
                                    <input type="text" id="rg" className="form-control form-control-sm" value={subscription.identityDocument} readOnly></input>
                                    <label className="form-label">Data de Emissão</label>
                                    <input type="text" id="data-emissao-rg" className="form-control form-control-sm" value={new Date(subscription.issuanceDate).toLocaleDateString()} readOnly></input>
                                    <label className="form-label">Orgão Emissor</label>
                                    <input type="text" id="orgao-emissor-rg" className="form-control form-control-sm" value={subscription.issuingAgency} readOnly></input>
                                    <label className="form-label">CPF</label>
                                    <input type="text" id="cpf" className="form-control form-control-sm" value={subscription.document} readOnly></input>
                                    <label className="form-label">Telefone</label>
                                    <input type="text" id="cpf" className="form-control form-control-sm" value={subscription.phoneNumber} readOnly></input>
                                    <label className="form-label">Telefone alternativo</label>
                                    <input type="text" id="cpf" className="form-control form-control-sm" value={subscription.alternativePhoneNumber} readOnly></input>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Documento com Foto</label>
                                    <br />
                                    <ImgThumbnail imgUrl={subscription.documentFile}/>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Infomações Adicionais</label>
                                    <textarea className="form-control" id="obs" rows={3} readOnly value={subscription.observation}></textarea>
                                </div>
                                
                                <div>
                                    <label className="form-label">Endereço Residencial</label>
                                    <br />
                                    <label className="form-label">Cidade</label>
                                    <input className="form-control form-control-sm" type="text" id="" value={subscription.city} readOnly/>
                                    <label className="form-label">Estado</label>
                                    <input className="form-control form-control-sm" type="text" id="" value={subscription.state} readOnly/>
                                    <label className="form-label">Bairro</label>
                                    <input className="form-control form-control-sm" type="text" id="" value={subscription.district} readOnly/>
                                    <label className="form-label">Rua</label>
                                    <input className="form-control form-control-sm" type="text" id="" value={subscription.street} readOnly/>
                                    <label className="form-label">CEP</label>
                                    <input className="form-control form-control-sm" type="text" id="" value={subscription.postalCode} readOnly/>
                                    {subscription.complement!=="" &&
                                    <>
                                        <label className="form-label">Complemento</label>
                                        <input className="form-control form-control-sm" type="text" id="" value={subscription.complement} readOnly/>
                                    </>
                                    }
                                    
                                    <label className="form-label">Número</label>
                                    <input className="form-control form-control-sm" type="text" id="" value={subscription.houseNumber} readOnly/>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                    <div className="row mt-3">

    <div className="col-12">
        <fieldset>
            <legend>Dados Profissionais</legend>
            <div className="mb-3">
                <label className="form-label">Empresa</label>
                <input className="form-control form-control-sm" type="text" id="" value={subscription.company} readOnly/>
                <label className="form-label">Cargo</label>
                <input className="form-control form-control-sm" type="text" id="" value={subscription.profession} readOnly/>
                <label className="form-label">Modalidade</label>
                <input className="form-control form-control-sm" type="text" id="" value={subscription.workRegime} readOnly/>
                <label className="form-label">Carga Horária</label>
                <input className="form-control form-control-sm" type="text" id="" value={subscription.workShift} readOnly/>
            </div>
            <div className="mb-3">
                <label className="form-label">Endereço Empresarial</label>
                    <div>
                        <label className="form-label">Cidade</label>
                        <input className="form-control form-control-sm" type="text" id="" value={subscription.cityCompany} readOnly/>
                        <label className="form-label">Estado</label>
                        <input className="form-control form-control-sm" type="text" id="" value={subscription.stateCompany} readOnly/>
                        <label className="form-label">Bairro</label>
                        <input className="form-control form-control-sm" type="text" id="" value={subscription.districtCompany} readOnly/>
                        <label className="form-label">Rua</label>
                        <input className="form-control form-control-sm" type="text" id="" value={subscription.streetCompany} readOnly/>
                        <label className="form-label">CEP</label>
                        <input className="form-control form-control-sm" type="text" id="" value={subscription.postalCodeCompany} readOnly/>
                        {subscription.complementCompany!=="" &&
                        <>
                            <label className="form-label">Complemento</label>
                            <input className="form-control form-control-sm" type="text" id="" value={subscription.complementCompany} readOnly/>
                        </>
                        }
                    </div>
                </div>
            </fieldset>
        </div>

        <div className="col-12">
            <fieldset>
                <legend>Dados Acadêmicos</legend>
                <div className="mb-3">
                    <label className="form-label">Graduação</label>
                    <input className="form-control form-control-sm" type="text" id="" value={subscription.graduation} readOnly/>
                    <label className="form-label">Instituição</label>
                    <input className="form-control form-control-sm" type="text" id="" value={subscription.graduationInstitution} readOnly/>
                    <div className="mb-3">
                        <label className="form-label">Comprovante de Graduação: </label>
                        <br />
                        <ImgThumbnail imgUrl={subscription.graduationProofFile}/>
                    </div>
                </div>
                {subscription.postgraduateLatoSensu!=="" && 
                    <>
                    <div className="mb-3">
                        <label className="form-label">Pós-Graduação Lato Sensu</label>
                        <input className="form-control form-control-sm" type="text" id="" value={subscription.postgraduateLatoSensu} readOnly/>
                        <label className="form-label">Instituição</label>
                        <input className="form-control form-control-sm" type="text" id="" value={subscription.postgraduateLatoSensuInstitution} readOnly/>
                    </div>
                    </>
                }
                {subscription.postgraduateStrictoSensu!=="" && 
                    <>
                    <div className="mb-3">
                        <label className="form-label">Pós-Graduação Stricto Sensu</label>
                        <input className="form-control form-control-sm" type="text" id="" value={subscription.postgraduateStrictoSensu} readOnly/>
                        <label className="form-label">Instituição</label>
                        <input className="form-control form-control-sm" type="text" id="" value={subscription.postgraduateStrictoSensuInstitution} readOnly/>
                    </div>
                    </>
                }
            </fieldset>
        </div>
    </div>
    
    {subscription.disability==="1" && subscription.disabilityType !== "" &&
        <>
        <div className="col-12">
        <fieldset>
                <legend>Deficiência</legend>
                <div className="mb-3">
                    <div>
                    <label className="form-label">Tipo de Deficiência</label>
                    <input className="form-control form-control-sm" type="text" id="" value={subscription.disabilityType} readOnly/>
                    </div>
                    <br />
                    <div>
                    <label className="form-label">Auxílios Solicitados para a Prova</label>
                    </div>

                    <div>
                    {subscription.specialTreatmentTypes?.map((treatment) => (
                        <li>{checkSpecialTreatment(treatment)}</li>
                    ))}
                    </div>
                </div>
        </fieldset>
        </div>
        </>
    }
    
    <div className="col-12">
        <fieldset>
            <legend>Formulários de Inscrição</legend>
            <div className="mb-3">
                {subscription.processForms?.map((form,key) => (
                <>
                    <div>
                        <label className="form-label">{form.name}</label>
                    </div>               
                    <div>
                        <ImgThumbnail imgUrl={form.url} />
                    </div>
                    <br />
                </>
                ))}
            </div>
        </fieldset>
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
                </>
            }

            {menuSelection == 'barema'
                && <>
                    <SelectiveBaremaAnalysis subscription={subscription} process={selectiveProcess}></SelectiveBaremaAnalysis>
                </>
            }
        </AdminBase>
    )
}

