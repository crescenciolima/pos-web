import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import React, { useEffect, useState } from 'react'
import AdminBase from '../../components/admin/admin-base'
import Head from 'next/head'
import API from '../../lib/api.service';
import { APIRoutes } from '../../utils/api.routes';
import { APIResponse } from '../../models/api-response';
import { SelectiveProcess, ProcessStepsState, ProcessStep, ProcessStepsTypes } from '../../models/selective-process';
import Loading from '../../components/loading';
import { format, sub } from 'date-fns';
import SelectiveProcessSubscriptionList from '../../components/selectiveprocess/dashboard/subscription-list';
import { Subscription, SubscriptionStatus } from '../../models/subscription';
import SelectiveProcessResourceList from '../../components/selectiveprocess/dashboard/resource-list';
import SelectiveProcessUtil from '../../lib/selectiveprocess.util';
import SelectiveProcessSubscriptionGrading from '../../components/selectiveprocess/dashboard/grading';
import { authAdmin } from "./../../utils/firebase-admin";
import Permission from '../../lib/permission.service';
import { UserType } from '../../enum/type-user.enum';
import ConfirmDialog from '../../components/confirm-dialog';

export default function Admin() {

  const [selectiveProcess, setSelectiveProcess] = useState<SelectiveProcess>({ title: '', state: ProcessStepsState.IN_CONSTRUCTION });
  const [loading, setLoading] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<ProcessStep>({ type: ProcessStepsTypes.INSCRICAO, startDate: 0, finishDate: 0, passingScore: 0, weight: 0, order: 0 });
  const [startDate, setStartDate] = useState<string>();
  const [finishDate, setFinishDate] = useState<string>();
  const [open, setOpen] = useState<boolean>(false);
  const [subscriptionList, setSubscriptionList] = useState<Subscription[]>([]);
  const [allResourcesChecked, setAllResourcesChecked] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);


  const api = API(setLoading);
  const processUtil = SelectiveProcessUtil();

  useEffect(() => {

    api.get(APIRoutes.SELECTIVE_PROCESS, { 'open': "true" }).then(
      async (result: APIResponse) => {
        if (result.result) {
          const process: SelectiveProcess = result.result;

          let subsResult: APIResponse = await api.get(APIRoutes.SUBSCRIPTION, { 'processID': process.id });
          let subsList: Subscription[] = subsResult.result || [];

          setSubscriptionList(subsList);

          setSelectiveProcess(process);

          getCurrentStep(process, subsList);

          setOpen(true);



        } else {
          setOpen(false);
        }
        console.log(result)
      }
    )

  }, []);

  const getCurrentStep = (process: SelectiveProcess, subsList: Subscription[]) => {
    const step = processUtil.getCurrentStep(process);

    const startDate = new Date(step.startDate);
    const finishDate = new Date(step.finishDate);
    setCurrentStep(step);
    setStartDate(format(startDate, 'dd/MM/yyyy'))
    setFinishDate(format(finishDate, 'dd/MM/yyyy'))

    //Verificando se todos os recursos foram julgados para homologação definitiva
    //Se algum recurso de inscrição ainda não foi julgado a homologação definitiva ainda não está completa
    if (step.type == ProcessStepsTypes.HOMOLOGACAO_DEFINITIVA_INSCRICAO) {
      for (let subscription of subsList) {
        if (subscription.resources) {
          for (let resource of subscription.resources) {
            if (resource.step == ProcessStepsTypes.INTERPOSICAO_RECURSO_INSCRICAO && resource.status == SubscriptionStatus.AGUARDANDO_ANALISE) {
              setAllResourcesChecked(false);
              break;
            }
          }
        }

      }
    }
  };

  function advanceStep(event) {
    event.stopPropagation();
    setOpenModal(true);
  }

  async function confirmAdvanceStep() {

    selectiveProcess.currentStep++;
    let response = await api.post(APIRoutes.SELECTIVE_PROCESS, selectiveProcess);
    if (!response.error) {
      setSelectiveProcess(response.result);
      getCurrentStep(response.result, subscriptionList);
    }
    closeModal();

  }

  function closeModal() {
    setOpenModal(false);
  }


  return (
    <AdminBase >
      {loading && <Loading />}
      {!open && !loading ?
        <>
          <div className="row mt-5 justify-content-center">
            <div className="col-10 col-md-4 col-lg-3">
              <img src="/images/admin/start.svg" alt="começar novo processo" />
            </div>
          </div>
          <div className="row mt-5 justify-content-center">
            <div className="col-12 text-center">
              <h5 className="text-primary-dark">Nenhum processo seletivo em andamento no momento<br></br> Para abrir um novo processo acesse o menu de "Processo Seletivo"</h5>
            </div>
          </div>
        </>
        : null}

      {open && !loading ?
        <>
          <div className="row">
            <div className="col-12">
              <h4 className="text-success mt-3" >
                Processo Seletivo {selectiveProcess.title} Em Andamento
              </h4>
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-12 text-center mt-3">
              <h6 className="d-inline">Etapa Atual: </h6>
              <h4 className="d-inline text-primary"><b>{currentStep.type}</b></h4>
              <h6 className="d-inline"> ({startDate} -- {finishDate})</h6>
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-12">

              {(currentStep.type == ProcessStepsTypes.INSCRICAO || currentStep.type == ProcessStepsTypes.HOMOLOGACAO_PRELIMINAR_INSCRICAO
                || (currentStep.type == ProcessStepsTypes.HOMOLOGACAO_DEFINITIVA_INSCRICAO))
                && <SelectiveProcessSubscriptionList process={selectiveProcess} currentStep={currentStep} subscriptionList={subscriptionList}></SelectiveProcessSubscriptionList>}
              {(currentStep.type == ProcessStepsTypes.INTERPOSICAO_RECURSO_INSCRICAO || currentStep.type == ProcessStepsTypes.INTERPOSICAO_RECURSO_ENTREVISTA || currentStep.type == ProcessStepsTypes.INTERPOSICAO_RECURSO_PROVA )
                && <SelectiveProcessResourceList process={selectiveProcess} currentStep={currentStep} subscriptionList={subscriptionList}></SelectiveProcessResourceList>}
              {(currentStep.type == ProcessStepsTypes.ENTREVISTA || currentStep.type == ProcessStepsTypes.INTERPOSICAO_RECURSO_ENTREVISTA || currentStep.type == ProcessStepsTypes.RESULTADO_DEFINITIVO_ENTREVISTA || currentStep.type == ProcessStepsTypes.RESULTADO_PRELIMINAR_ENTREVISTA || currentStep.type == ProcessStepsTypes.PROVA)
                && <SelectiveProcessSubscriptionGrading process={selectiveProcess} currentStep={currentStep} subscriptionList={subscriptionList}></SelectiveProcessSubscriptionGrading>}

            </div>
          </div>

          <div className="row mt-5">
            <div className="col-12 text-center">
              <button className="btn btn-primary" onClick={advanceStep}>Avançar para próxima etapa</button>
            </div>
          </div>
        </>
        : null}

    <ConfirmDialog open={openModal} 
    actionButtonText="Avançar Etapa" title="Avançar Etapa" 
    text={"Tem certeza que deseja avançar para a próxima etapa do processo seletivo?"} onClose={closeModal} onConfirm={confirmAdvanceStep} />

    </AdminBase>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const permission = Permission();
  return await permission.checkPermission(ctx, [UserType.MASTER, UserType.ADMIN]);
};
