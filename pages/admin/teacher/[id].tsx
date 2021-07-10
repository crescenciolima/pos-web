import React, { useEffect, useState } from 'react'

import AdminBase from '../../../components/admin-base'
import { APIRoutes } from '../../../lib/api.routes'
import { Teacher } from '../../../models/teacher';
import { useRouter } from 'next/router'
import Link from 'next/link';
import * as Yup from 'yup'
import { ErrorMessage, Field, Formik } from 'formik'
import { toast } from 'react-nextjs-toast'
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import { GetServerSidePropsContext } from 'next';
import { UserType } from '../../../enum/type-user.enum';
import Permission from '../../../lib/permission.service';

export default function SaveTeacherLayout() {

    const router = useRouter();
    const api = API();

    const [teacher, setTeacher] = useState<Teacher>({
        name: "",
        about: "",
        email: "",
        phone: "",
        photo: "",
    });
    const [file, setFile] = useState<FileList>();
    // const [newTeacher, setNewTeacher] = useState<boolean>(false);

    useEffect(() => {

        const { id } = router.query;
        if (id) {
            if (id.toString() == "new") {
                // setNewTeacher(true);
            } else {
                console.log(id);
                getTeacher(id.toString());
                // setNewTeacher(false);
            }
        }

    }, [router.query]);

    const getTeacher = async (id: string) => {
        //Recupera o valor do banco de dados
        const result: APIResponse = await api.get(APIRoutes.TEACHER, { 'id': id });
        const teacher: Teacher = result.result;
        setTeacher(teacher);
    }

    const saveTeacher = async (values: Teacher) => {
        console.log(values);
        console.log(teacher);
        if(teacher.photo != ""){
            values = {...values, photo: teacher.photo};
        }
        api.postFile(APIRoutes.TEACHER, values, file && file.length > 0 ? file[0] : null);
    };

    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true);
            await saveTeacher(values);
        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }
 


    return (
        <AdminBase>
            <div className="row mb-3">
                <div className="col-12 text-right">
                    <Link href="/admin/teacher">
                        <a className="link-primary ">Voltar</a>
                    </Link>
                </div>
            </div>
            <Formik
                enableReinitialize
                initialValues={{ ...teacher, photo: '', file: undefined }}
                validationSchema={
                    Yup.object().shape({
                        name: Yup.string().required('Preencha este campo.'),
                        about: Yup.string().required('Preencha este campo.'),
                        photo: teacher.photo ? null : Yup.string().required('Preencha este campo.'),
                        email: Yup.string().required('Preencha este campo.'),
                        phone: Yup.string().required('Preencha este campo.'),
                    })}
                onSubmit={onSubmit}>
                {({
                    values,
                    isSubmitting,
                    handleSubmit,
                    handleChange,
                    setFieldValue
                }) => (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Nome</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                id="name"
                                placeholder="Nome do docente"
                                value={values.name}
                                onChange={handleChange} />
                            <ErrorMessage name="name" className="input-error" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="photo" className="form-label">Foto</label>
                            <input
                                type="file"
                                className="form-control"
                                name="photo"
                                id="photo"
                                value={values.photo}
                                onChange={(event) => {
                                    handleChange(event);
                                    setFile(event.currentTarget.files);
                                }} />

                            <ErrorMessage name="photo" className="input-error" />
                        </div>
                        {teacher.photo &&
                         <div className="mb-3 text-center">
                         <img src={teacher.photo} className="img-thumbnail" alt="..."></img>
                         </div>
                        }
                       
                        <div className="mb-3">
                            <label htmlFor="about" className="form-label">Sobre</label>
                            <textarea
                                className="form-control"
                                name="about"
                                id="about"
                                rows={3}
                                value={values.about}
                                onChange={handleChange}
                            ></textarea>
                            <ErrorMessage name="about" className="input-error" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                id="email"
                                placeholder=""
                                value={values.email}
                                onChange={handleChange} />
                            <ErrorMessage name="email" className="input-error" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Telefone</label>
                            <input
                                type="phone"
                                className="form-control"
                                name="phone"
                                id="phone"
                                placeholder=""
                                value={values.phone}
                                onChange={handleChange} />
                            <ErrorMessage name="phone" className="input-error" />
                        </div>
                        <div className="text-right">
                        <button type="submit" className="btn btn-primary mt-3 me-auto" disabled={isSubmitting}>Salvar</button>
                        </div>
                    </form>
                )}
            </Formik>
        </AdminBase>
    )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const permission = Permission();
    return await permission.checkPermission(ctx, [UserType.MASTER, UserType.ADMIN]);
  };

