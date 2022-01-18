import React, { useEffect, useState } from 'react'

import AdminBase from '../../../components/admin/admin-base'
import { APIRoutes } from '../../../utils/api.routes'
import Link from 'next/link';
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import Loading from '../../../components/loading';
import ConfirmDialog from '../../../components/confirm-dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { Works } from '../../../models/works';
import { format } from 'date-fns';
import { GetServerSidePropsContext } from 'next';
import { UserType } from '../../../enum/type-user.enum';
import Permission from '../../../lib/permission.service';


export default function WorksLayout() {

  const [worksList, setWorksList] = useState<Works[]>([]);
  const [selectedWork, setSelectedWork] = useState<Works>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const api = API(setLoading);

  useEffect(() => {

    api.get(APIRoutes.WORKS).then(
      (result: APIResponse) => {
        let worksList: Works[] = result?.result;
        setWorksList(worksList);
      }
    )

  }, []);

  function removeWorks(event, work: Works) {
    event.stopPropagation();
    setSelectedWork(work);
    setOpenModal(true);
  }

  async function confirmWorksRemoval() {
    await api.exclude(APIRoutes.WORKS, { id: selectedWork.id });
    let workWorksist = worksList.filter(works => works.id != selectedWork.id);
    setWorksList(workWorksist);
    closeModal();
  }

  function closeModal() {
    setOpenModal(false);
  }


  return (
    <AdminBase>
      <div className="row">
        <div className="col-6">
          <h3 className="text-primary-dark">Trabalhos</h3>
        </div>
        <div className="col-6 text-right">
          <Link href="/admin/works/new">
            <a className="btn btn-primary">Cadastrar</a>
          </Link>
        </div>
      </div>
      <div className="row mt-5">
        <div className="col-12 table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Título</th>
                <th>Data</th>
                <th>Excluir</th>
              </tr>
            </thead>
            <tbody>
              {worksList?.map((workItem, i) => {
                return (
                  <Link href={`/admin/works/${encodeURIComponent(workItem.id)}`} key={workItem.id}>
                    <tr>
                      <td>{workItem.title}</td>
                      <td>{(new Date(workItem.date)).toLocaleString()}</td>
                      <td><button className="btn btn-sm btn-danger" onClick={(e) => removeWorks(e, workItem)} >
                        <FontAwesomeIcon icon={faTrash} className="sm-icon" />
                      </button></td>
                    </tr>
                  </Link>
                )
              })}

            </tbody>
          </table>
          {((!worksList || worksList?.length == 0) && !isLoading) &&
            <div className="alert alert-info mt-3 text-center">
              Nenhum resultado encontrado.
            </div>
          }

        </div>
      </div>
      {isLoading &&
        <Loading />
      }
      <ConfirmDialog open={openModal} actionButtonText="Excluir" title="Excluir" text={"Tem certeza que deseja excluir " + selectedWork?.title + "?"} onClose={closeModal} onConfirm={confirmWorksRemoval} />
    </AdminBase>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const permission = Permission();
  return await permission.checkPermission(ctx, [UserType.MASTER, UserType.ADMIN]);
};

