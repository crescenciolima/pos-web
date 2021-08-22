import React, { useEffect, useState } from 'react'

import AdminBase from '../../../components/admin/admin-base'
import { User } from '../../../models/user';
import Link from 'next/link';
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import Loading from '../../../components/loading';
import ConfirmDialog from '../../../components/confirm-dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { UserType } from '../../../enum/type-user.enum';
import Permission from '../../../lib/permission.service';
import { APIRoutes } from '../../../utils/api.routes';


export default function UserLayout(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User>({name:"",email:"",});
  const [isLoading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalText, setModalText] = useState<string>("Tem certeza que deseja excluir esse usuário?");

  const api = API(setLoading);

  useEffect(() => {

    api.get(APIRoutes.USER).then(
      (result: APIResponse) => {
        setUsers(result.result);
      }
    )

  }, []);

  function removeUser(event, user: User) {
    event.stopPropagation();
    setSelectedUser(user);
    setOpenModal(true);
  }

  async function confirmUserRemoval(){
   await api.exclude(APIRoutes.USER, {id:selectedUser.id});
   let newUserList =  users.filter(user => user.id != selectedUser.id);
   setUsers(newUserList);
   closeModal();
  }

  function closeModal() {
    setOpenModal(false);
  }


  return (
    <AdminBase>
      <div className="row">
        <div className="col-6">
          <h3 className="text-primary-dark">Usuários</h3>
        </div>
        <div className="col-6 text-right">
          <Link href="/admin/user/new">
            <a className="btn btn-primary">Cadastrar</a>
          </Link>
        </div>
      </div>
      <div className="row mt-5">
        <div className="col-12 table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Excluir</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => {
                return (
                  <Link href={`/admin/user/${encodeURIComponent(user.id)}`} key={user.id}>
                    <tr>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><button className="btn btn-sm btn-danger" onClick={(e) => removeUser(e, user)} >
                        <FontAwesomeIcon icon={faTrash} className="sm-icon" />
                      </button></td>
                    </tr>
                  </Link>
                )
              })}

            </tbody>
          </table>
          {(users.length == 0 && !isLoading) &&
            <div className="alert alert-info mt-3 text-center">
              Nenhum resultado encontrado.
            </div>
          }

        </div>
      </div>
      {isLoading &&
        <Loading />
      }
      <ConfirmDialog open={openModal} actionButtonText="Excluir" title="Excluir" text={"Tem certeza que deseja excluir "+selectedUser.name+"?"} onClose={closeModal} onConfirm={confirmUserRemoval} />
    </AdminBase>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const permission = Permission();
  return await permission.checkPermission(ctx, [UserType.MASTER]);
};

