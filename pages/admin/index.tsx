import { GetServerSidePropsContext } from 'next'
import React, { useEffect, useState } from 'react'
import AdminBase from '../../components/admin/admin-base'
import API from '../../lib/api.service';
import { APIRoutes } from '../../utils/api.routes';
import { APIResponse } from '../../models/api-response';
import Loading from '../../components/loading';
import { format } from 'date-fns';
import SelectiveProcessSubscriptionList from '../../components/selectiveprocess/dashboard/subscription-list';
import { Subscription } from '../../models/subscription/subscription';
import SelectiveProcessResourceList from '../../components/selectiveprocess/dashboard/resource-list';
import SelectiveProcessUtil from '../../lib/selectiveprocess.util';
import SelectiveProcessSubscriptionGrading from '../../components/selectiveprocess/dashboard/grading';
import Permission from '../../lib/permission.service';
import { UserType } from '../../enum/type-user.enum';
import ConfirmDialog from '../../components/confirm-dialog';
import SelectiveBaremaAnalysisList from '../../components/selectiveprocess/dashboard/barema-analysis';
import SelectiveBaremaResults from '../../components/selectiveprocess/dashboard/barema-results';
import SelectiveProcessFinalResult from '../../components/selectiveprocess/dashboard/final-result';
import { SelectiveProcess } from '../../models/subscription-process/selective-process';
import { ProcessStepsState } from '../../models/subscription-process/process-steps-state.enum';
import { ProcessStepsTypes } from '../../models/subscription-process/process-steps-types.enum';
import { ProcessStep } from '../../models/subscription-process/process-step';

export default function Admin() {

  const [selectiveProcess, setSelectiveProcess] = useState<SelectiveProcess>({ title: '', state: ProcessStepsState.IN_CONSTRUCTION });
  const [loading, setLoading] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<ProcessStep>({ type: ProcessStepsTypes.INSCRICAO, startDate: 0, finishDate: 0, passingScore: 0, weight: 0, order: 0 });
  const [startDate, setStartDate] = useState<string>();
  const [finishDate, setFinishDate] = useState<string>();
  const [isSelectiveProcessOpen, setSelectiveProcessOpen] = useState<boolean>(false);
  const [subscriptionList, setSubscriptionList] = useState<Subscription[]>([]);
  const [isStepModalOpen, setStepModalOpen] = useState<boolean>(false);
  const [isFinishModalOpen, setFinishModalOpen] = useState<boolean>(false);
  const [reservedPlacesMap, setReservedPlacesMap] = useState<any>({});


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
          let placesMap = {};
          //Mapa de vagas
          for (let place of process.reservedPlaces) {
            placesMap[place.uuid] = place.name;
          }
          setReservedPlacesMap(placesMap);


          getCurrentStep(process, subsList);

          setSelectiveProcessOpen(true);


        } else {
          setSelectiveProcessOpen(false);
        }
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

  };

  function finishProcess(event) {
    event.stopPropagation();
    setFinishModalOpen(true);
  }

  function advanceStep(event) {
    event.stopPropagation();

    setStepModalOpen(processUtil.isCurrentStepValid(selectiveProcess, subscriptionList));
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

  async function confirmFinishProcess() {

    selectiveProcess.state = ProcessStepsState.FINISHED;
    let response = await api.post(APIRoutes.SELECTIVE_PROCESS, selectiveProcess);
    if (!response.error) {
      setSelectiveProcess(response.result);
      setSelectiveProcessOpen(false);
    }
    closeModal();

  }

  function closeModal() {
    setStepModalOpen(false);
    setFinishModalOpen(false);
  }


  return (
    <AdminBase >
      {loading && <Loading />}
      {!isSelectiveProcessOpen && !loading ?
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

      {isSelectiveProcessOpen && !loading ?
        <>
          <div className="row">
            <div className="col-12">
              <h4 className="text-success mt-3" >
                Processo Seletivo {selectiveProcess.title}
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

              {(
                currentStep.type == ProcessStepsTypes.INSCRICAO
                || currentStep.type == ProcessStepsTypes.HOMOLOGACAO_PRELIMINAR_INSCRICAO
                || currentStep.type == ProcessStepsTypes.HOMOLOGACAO_DEFINITIVA_INSCRICAO

              )
                && <SelectiveProcessSubscriptionList process={selectiveProcess} currentStep={currentStep} setBaseProcess={setSelectiveProcess} subscriptionList={subscriptionList} reservedPlacesMap={reservedPlacesMap}></SelectiveProcessSubscriptionList>}
              {(
                currentStep.type == ProcessStepsTypes.INTERPOSICAO_RECURSO_INSCRICAO
                || currentStep.type == ProcessStepsTypes.INTERPOSICAO_RECURSO_ENTREVISTA
                || currentStep.type == ProcessStepsTypes.INTERPOSICAO_RECURSO_PROVA
                || currentStep.type == ProcessStepsTypes.INTERPOSICAO_RECURSO_AVALIACAO_CURRICULAR
              )
                && <SelectiveProcessResourceList process={selectiveProcess} currentStep={currentStep} subscriptionList={subscriptionList} reservedPlacesMap={reservedPlacesMap}></SelectiveProcessResourceList>}
              {(currentStep.type == ProcessStepsTypes.ENTREVISTA
                || currentStep.type == ProcessStepsTypes.INTERPOSICAO_RECURSO_ENTREVISTA
                || currentStep.type == ProcessStepsTypes.RESULTADO_DEFINITIVO_ENTREVISTA
                || currentStep.type == ProcessStepsTypes.RESULTADO_PRELIMINAR_ENTREVISTA
                || currentStep.type == ProcessStepsTypes.PROVA
                || currentStep.type == ProcessStepsTypes.INTERPOSICAO_RECURSO_PROVA
                || currentStep.type == ProcessStepsTypes.RESULTADO_DEFINITIVO_PROVA
                || currentStep.type == ProcessStepsTypes.RESULTADO_PRELIMINAR_PROVA
              )
                && <SelectiveProcessSubscriptionGrading process={selectiveProcess} currentStep={currentStep} subscriptionList={subscriptionList} 
                reservedPlacesMap={reservedPlacesMap} setBaseProcess={setSelectiveProcess}></SelectiveProcessSubscriptionGrading>}
              {(currentStep.type == ProcessStepsTypes.AVALIACAO_CURRICULAR)
                && <SelectiveBaremaAnalysisList process={selectiveProcess} currentStep={currentStep} subscriptionList={subscriptionList} reservedPlacesMap={reservedPlacesMap}></SelectiveBaremaAnalysisList>
              }
              {((currentStep.type == ProcessStepsTypes.RESULTADO_PRELIMINAR_AVALIACAO_CURRICULAR)
                || (currentStep.type == ProcessStepsTypes.RESULTADO_DEFINITIVO_AVALIACAO_CURRICULAR))
                && <SelectiveBaremaResults process={selectiveProcess} currentStep={currentStep} setBaseProcess={setSelectiveProcess} subscriptionList={subscriptionList} reservedPlacesMap={reservedPlacesMap}></SelectiveBaremaResults>
              }
              {(currentStep.type == ProcessStepsTypes.RESULTADO_DEFINITIVO_PROCESSO_SELETIVO)
                && <SelectiveProcessFinalResult process={selectiveProcess} currentStep={currentStep} setBaseProcess={setSelectiveProcess} subscriptionList={subscriptionList} reservedPlacesMap={reservedPlacesMap}></SelectiveProcessFinalResult>
              }

            </div>
          </div>

          <div className="row mt-5">
            <div className="col-12 text-center">
              {(selectiveProcess.steps.length - 1 > selectiveProcess.currentStep) && <button className="btn btn-primary" onClick={advanceStep}>Avançar para próxima etapa</button>}
              {(selectiveProcess.steps.length - 1 == selectiveProcess.currentStep) && <button className="btn btn-primary" onClick={finishProcess}>Encerrar Processo Seletivo</button>}
            </div>
          </div>
        </>
        : null}

      <ConfirmDialog open={isStepModalOpen}
        actionButtonText="Avançar Etapa" title="Avançar Etapa"
        text={"Tem certeza que deseja avançar para a próxima etapa do processo seletivo?"} onClose={closeModal} onConfirm={confirmAdvanceStep} />

      <ConfirmDialog open={isFinishModalOpen}
        actionButtonText="Encerrar Processo" title="Encerrar Processo"
        text={"Tem certeza que deseja encerrar esse processo seletivo?"} onClose={closeModal} onConfirm={confirmFinishProcess} />

    </AdminBase>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const permission = Permission();
  return await permission.checkPermission(ctx, [UserType.MASTER, UserType.ADMIN]);
};
