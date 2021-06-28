import React, { useEffect, useState } from 'react'

import AdminBase from '../../../components/admin-base'
import { APIRoutes } from '../../../lib/api.routes'
import { Teacher } from '../../../models/teacher';
import Link from 'next/link';
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import Loading from '../../../components/loading';
import ConfirmDialog from '../../../components/confirm-dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUniversalAccess, faFileAlt } from '@fortawesome/free-solid-svg-icons'
import { SelectiveProcess } from '../../../models/selective-process';
import fire from '../../../utils/firebase-util';
import SelectiveProcessBasicInfo from '../../../components/selectiveprocess/basic-info';
import SelectiveProcessPlaces from '../../../components/selectiveprocess/places';


export default function SelectiveProcessLayout() {

  const [selectiveProcess, setSelectiveProcess] = useState<SelectiveProcess>({ title: '', inConstruction: false, open: false });
  const [isLoading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [inConstruction, setInConstruction] = useState<boolean>(false);
  const [newProcessTitle, setNewProcessTitle] = useState('');
  const [menuSelection, setMenuSelection] = useState<string>("dadosbasicos");


  const api = API(setLoading);

  useEffect(() => {

    api.get(APIRoutes.SELECTIVE_PROCESS, { 'inconstruction': "true" }).then(
      (result: APIResponse) => {
        if (result.result) {
          setInConstruction(true);
          setSelectiveProcess(result.result);
        } else {
          setInConstruction(false);
        }
        console.log(result)
      }
    )

  }, []);

  function handleNewProcessSubmit(event) {
    event.stopPropagation();
    const process: SelectiveProcess = {
      title: newProcessTitle,
      open: false,
      inConstruction: true,
      creationDate: fire.firestore.Timestamp.now().seconds
    }
    console.log(process)
    api.post(APIRoutes.SELECTIVE_PROCESS, process).then(
      (result: APIResponse) => {
        if (result.result) {
          setInConstruction(true);
          setSelectiveProcess(result.result);
        } else {
          setInConstruction(false);
        }
      }
    );
  }

  // function selectMenu(selection:string) {
  //   setMenuSelection(selection);
  // }
  // function closeModal() {
  //   setOpenModal(false);
  // }

  function menusSaveCallback(process:SelectiveProcess) {
    setSelectiveProcess(process);
  }


  return (
    <AdminBase>
      <div className="row">
        <div className="col-6">
          <h3 className="text-primary-dark">Processo Seletivo</h3>
        </div>
        {/* <div className="col-6 text-right">
          <Link href="/admin/teacher/new">
            <a className="btn btn-primary">Cadastrar</a>
          </Link>
        </div> */}
      </div>
      {(!inConstruction && !isLoading) &&
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
      {(inConstruction && !isLoading) &&
        <>
          <div className="row mt-5 justify-content-center">
            <div className="col-12">
              <ul className="nav nav-tabs nav-fill">
                <li className="nav-item">
                  <a className={'nav-link ' + (menuSelection == 'dadosbasicos' ? 'active' : '')} onClick={(e) => setMenuSelection('dadosbasicos')} aria-current="page" >
                  <FontAwesomeIcon icon={faFileAlt} className="sm-icon me-2" />Dados básicos</a>
                </li>
                <li className="nav-item">
                  <a className={'nav-link ' + (menuSelection == 'vagas' ? 'active' : '')} onClick={(e) => setMenuSelection('vagas')}>
                    <FontAwesomeIcon icon={faUniversalAccess} className="sm-icon me-2" /> Vagas</a>
                </li>
                <li className="nav-item">
                  <a className={'nav-link ' + (menuSelection == 'edital' ? 'active' : '')} onClick={(e) => setMenuSelection('edital')} href="#">Edital</a>
                </li>
                <li className="nav-item">
                  <a className={'nav-link ' + (menuSelection == 'outro' ? 'active' : '')} href="#" aria-disabled="true">Disabled</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-12">
              {(menuSelection == 'dadosbasicos') && <SelectiveProcessBasicInfo process={selectiveProcess} saveCallback={menusSaveCallback}></SelectiveProcessBasicInfo>}
              {(menuSelection == 'vagas') && <SelectiveProcessPlaces process={selectiveProcess} saveCallback={menusSaveCallback}></SelectiveProcessPlaces>}
            </div>
          </div>

        </>
      }
      {isLoading &&
        <Loading />
      }
      {/* <ConfirmDialog open={openModal} actionButtonText="Excluir" title="Excluir" text={"Tem certeza que deseja excluir " + selectedTeacher.name + "?"} onClose={closeModal} onConfirm={confirmTeacherRemoval} /> */}
    </AdminBase>
  )
}

