import React, { useEffect, useState } from 'react'

import AdminBase from '../../../components/admin/admin-base'
import { APIRoutes } from '../../../utils/api.routes'
import { Teacher } from '../../../models/teacher';
import Link from 'next/link';
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import Loading from '../../../components/loading';
import ConfirmDialog from '../../../components/confirm-dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { GetServerSidePropsContext } from 'next';
import { UserType } from '../../../enum/type-user.enum';
import Permission from '../../../lib/permission.service';


export default function TeacherLayout() {

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher>({name:"", about:"",email:"",phone:"",photo:""});
  const [isLoading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const api = API(setLoading);

  useEffect(() => {

    api.get(APIRoutes.TEACHER).then(
      (result: APIResponse) => {
        setTeachers(result.result);
      }
    )

  }, []);

  function removeTeacher(event, teacher: Teacher) {
    event.stopPropagation();
    setSelectedTeacher(teacher);
    setOpenModal(true);
  }

  async function confirmTeacherRemoval(){
   await api.exclude(APIRoutes.TEACHER, {id:selectedTeacher.id});
   let newTeacherList =  teachers.filter(teacher => teacher.id != selectedTeacher.id);
   setTeachers(newTeacherList);
   closeModal();
  }

  function closeModal() {
    setOpenModal(false);
  }


  return (
    <AdminBase>
      <div className="row">
        <div className="col-6">
          <h3 className="text-primary-dark">Docentes</h3>
        </div>
        <div className="col-6 text-right">
          <Link href="/admin/teacher/new">
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
              {teachers.map((teacher, i) => {
                return (
                  <Link href={`/admin/teacher/${encodeURIComponent(teacher.id)}`} key={teacher.id}>
                    <tr>
                      <td>{teacher.name}</td>
                      <td>{teacher.email}</td>
                      <td><button className="btn btn-sm btn-danger" onClick={(e) => removeTeacher(e, teacher)} >
                        <FontAwesomeIcon icon={faTrash} className="sm-icon" />
                      </button></td>
                    </tr>
                  </Link>
                )
              })}

            </tbody>
          </table>
          {(teachers.length == 0 && !isLoading) &&
            <div className="alert alert-info mt-3 text-center">
              Nenhum resultado encontrado.
            </div>
          }

        </div>
      </div>
      {isLoading &&
        <Loading />
      }
      <ConfirmDialog open={openModal} actionButtonText="Excluir" title="Excluir" text={"Tem certeza que deseja excluir "+selectedTeacher.name+"?"} onClose={closeModal} onConfirm={confirmTeacherRemoval} />
    </AdminBase>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const permission = Permission();
  return await permission.checkPermission(ctx, [UserType.MASTER, UserType.ADMIN]);
};

