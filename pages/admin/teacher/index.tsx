import React, { useEffect, useState } from 'react'

import AdminBase from '../../../components/admin-base'
import { APIRoutes } from '../../../lib/api.routes'
import { Teacher } from '../../../models/teacher';
import Link from 'next/link';

export default function TeacherLayout() {

  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {

    fetch(
      APIRoutes.TEACHER, { method: 'GET' }
    ).then(
      (response: Response) => {
        response.json().then(
          (teachers: Teacher[]) => {
            setTeachers(teachers)
          }
        )
      }
    ).catch((error) => {
      alert("Ocorreu um erro ao buscar os dados");
    });


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
                  <tr key={teacher.id}>
                    <td>{teacher.name}</td>
                    <td>{teacher.email}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminBase>
  )
}

