import React, { useEffect, useState } from 'react'

import { APIRoutes } from '../../../utils/api.routes'
import AdminBase from '../../../components/admin/admin-base'
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import Loading from '../../../components/loading';
import ConfirmDialog from '../../../components/confirm-dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket } from '@fortawesome/free-solid-svg-icons'
import SelectiveProcessBasicInfo from '../../../components/selectiveprocess/basic-info';
import SelectiveProcessPlaces from '../../../components/selectiveprocess/places';
import SelectiveProcessBarema from '../../../components/selectiveprocess/barema';
import SelectiveProcessDocuments from '../../../components/selectiveprocess/documents';
import SelectiveProcessSteps from '../../../components/selectiveprocess/steps';
import { GetServerSidePropsContext } from 'next';
import { UserType } from '../../../enum/type-user.enum';
import Permission from '../../../lib/permission.service';
import { SelectiveProcess } from '../../../models/subscription-process/selective-process';
import { ProcessStepsState } from '../../../models/subscription-process/process-steps-state.enum';



export default function SelectiveProcessLayout() {

  const [selectiveProcess, setSelectiveProcess] = useState<SelectiveProcess>({ title: '', state: ProcessStepsState.IN_CONSTRUCTION });
  const [isLoading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [hasProcess, setHasProcess] = useState<boolean>(false);
  const [newProcessTitle, setNewProcessTitle] = useState('');
  const [menuSelection, setMenuSelection] = useState<string>("dadosbasicos");


  const api = API(setLoading);

  useEffect(() => {

    api.get(APIRoutes.SELECTIVE_PROCESS, { 'inconstruction': "true" }).then(
      (result: APIResponse) => {
        if (result.result) {
          setHasProcess(true);
          setSelectiveProcess(result.result);
        } else {
          setHasProcess(false);
        }
      }
    )

  }, []);

  function handleNewProcessSubmit(event) {
    event.stopPropagation();
    const process: SelectiveProcess = {
      title: newProcessTitle,
      state: ProcessStepsState.IN_CONSTRUCTION,
      creationDate: Date.now()
    }
    api.post(APIRoutes.SELECTIVE_PROCESS, process).then(
      (result: APIResponse) => {
        if (result.result) {
          setHasProcess(true);
          setSelectiveProcess(result.result);
        } else {
          setHasProcess(false);
        }
      }
    );
  }

  function openProcess(event) {
    event.stopPropagation();
    if (checkSelectiveProcess()) {
      setOpenModal(true);
    }
  }

  function checkSelectiveProcess(): boolean {

    if(!selectiveProcess?.processNotices || selectiveProcess?.processNotices?.length == 0 ){
      api.showNotify("Antes de abrir o processo seletivo, cadastre seu edital em Documentos","error","Informações incompletas",4);
      return false;
    }

    if(!selectiveProcess?.baremaCategories || selectiveProcess?.baremaCategories?.length == 0 ){
      api.showNotify("Antes de abrir o processo seletivo, cadastre o Barema","error","Informações incompletas",4);
      return false;
    }

    if(!selectiveProcess?.steps || selectiveProcess?.steps?.length == 0 ){
      api.showNotify("Antes de abrir o processo seletivo, cadastre suas etapas","error","Informações incompletas",4);
      return false;
    }


    return true;
  }

  async function confirmOpenProcess() {

    selectiveProcess.state = ProcessStepsState.OPEN;
    selectiveProcess.currentStep = 0;

    const result = await api.post(APIRoutes.SELECTIVE_PROCESS, selectiveProcess);

    setSelectiveProcess(result.result);
    closeModal();

  }

  function closeModal() {
    setOpenModal(false);
  }

  function menusSaveCallback(process: SelectiveProcess) {
    setSelectiveProcess({ ...selectiveProcess, ...process });
  }


  return (
    <AdminBase>
      <div className="row mb-2">
        <div className="col-6">
          <h3 className="text-primary-dark">Processo Seletivo</h3>
        </div>
        <div className="col-6 text-right">
          {selectiveProcess.state == ProcessStepsState.IN_CONSTRUCTION && hasProcess ?
            <button type="button" className="btn btn-success mt-3 me-auto" onClick={openProcess}>
              <FontAwesomeIcon icon={faRocket} className="sm-icon" /> Abrir Processo Seletivo
            </button>
            : null
          }
          {selectiveProcess.state == ProcessStepsState.OPEN ?
            <h4 className="text-success mt-3 me-auto" >
              Em Andamento
            </h4>
            : null
          }
        </div>
      </div>
      {(!hasProcess && !isLoading) &&
        <>
          <div className="row mt-5 justify-content-center">
            <div className="col-10 col-md-4 col-lg-3">
              <img src="/images/admin/start.svg" alt="começar novo processo" />
            </div>
          </div>
          <div className="row mt-5 justify-content-center">
            <div className="col-12 text-center">
              <h5 className="text-primary-dark">Nenhum processo seletivo em construção no momento</h5>
            </div>
            <div className="col-12 col-md-10 col-lg-8 mb-3">
              <label htmlFor="name" className="form-label">Título</label>
              <input
                type="text"
                className="form-control"
                name="name"
                id="name"
                placeholder="Ex: 2022.1" onChange={({ target }) => setNewProcessTitle(target.value)} />
            </div>
            <div className="col-12 text-center">
              <button onClick={handleNewProcessSubmit} type="button" className="btn btn-primary mt-3 me-auto" disabled={newProcessTitle.length == 0}>
                {!isLoading && <>Iniciar Novo Processo</>}
                {isLoading && <>Enviando...</>}
              </button>
            </div>
          </div>
        </>
      }
      {(hasProcess && !isLoading) &&
        <>
          <div className="row mt-5 justify-content-center">
            <div className="col-12">
              <ul className="nav nav-tabs nav-fill">
                <li className="nav-item">
                  <a className={'nav-link ' + (menuSelection == 'dadosbasicos' ? 'active' : '')} onClick={(e) => setMenuSelection('dadosbasicos')} aria-current="page" >Dados básicos</a>
                </li>
                <li className="nav-item">
                  <a className={'nav-link ' + (menuSelection == 'places' ? 'active' : '')} onClick={(e) => setMenuSelection('places')}> Vagas</a>
                </li>
                <li className="nav-item">
                  <a className={'nav-link ' + (menuSelection == 'documents' ? 'active' : '')} onClick={(e) => setMenuSelection('documents')} >Documentos</a>
                </li>
                <li className="nav-item">
                  <a className={'nav-link ' + (menuSelection == 'barema' ? 'active' : '')} aria-disabled="true" onClick={(e) => setMenuSelection('barema')} >Barema</a>
                </li>
                <li className="nav-item">
                  <a className={'nav-link ' + (menuSelection == 'steps' ? 'active' : '')} aria-disabled="true" onClick={(e) => setMenuSelection('steps')} >Etapas</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-12">
              {(menuSelection == 'dadosbasicos') && <SelectiveProcessBasicInfo process={selectiveProcess} saveCallback={menusSaveCallback}></SelectiveProcessBasicInfo>}
              {(menuSelection == 'places') && <SelectiveProcessPlaces process={selectiveProcess} saveCallback={menusSaveCallback}></SelectiveProcessPlaces>}
              {(menuSelection == 'barema') && <SelectiveProcessBarema process={selectiveProcess} saveCallback={menusSaveCallback}></SelectiveProcessBarema>}
              {(menuSelection == 'documents') && <SelectiveProcessDocuments process={selectiveProcess} saveCallback={menusSaveCallback}></SelectiveProcessDocuments>}
              {(menuSelection == 'steps') && <SelectiveProcessSteps process={selectiveProcess} saveCallback={menusSaveCallback}></SelectiveProcessSteps>}
            </div>
          </div>

        </>
      }
      {isLoading &&
        <Loading />
      }
      <ConfirmDialog open={openModal} actionButtonText="Abrir Processo Seletivo" title="Abrir Processo Seletivo" text={"Tem certeza que deseja abrir esse processo seletivo para o público?"} onClose={closeModal} onConfirm={confirmOpenProcess} />
    </AdminBase>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const permission = Permission();
  return await permission.checkPermission(ctx, [UserType.MASTER, UserType.ADMIN]);
};
