import React, { useEffect, useState } from 'react'

import AdminBase from '../../../components/admin-base'
import { APIRoutes } from '../../../lib/api.routes'
import { Teacher } from '../../../models/teacher';
import Link from 'next/link';
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import Loading from '../../../components/loading';


export default function TeacherLayout() {

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const api = API(setLoading);

  useEffect(() => {

    api.get(APIRoutes.TEACHER).then(
      (result: APIResponse) => {
        setTeachers(result.result);
      }
    )

  }, []);


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
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, i) => {
                return (
                  <Link href={`/admin/teacher/${encodeURIComponent(teacher.id)}`} key={teacher.id}>
                    <tr>
                      <td>{teacher.name}</td>
                      <td>{teacher.email}</td>
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

    </AdminBase>
  )
}

