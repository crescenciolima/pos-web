import React, { useEffect, useState } from 'react'

import AdminBase from '../../../components/admin-base'
import { APIRoutes } from '../../../lib/api.routes'
import { Teacher } from '../../../models/teacher';
import { useRouter } from 'next/router'
import Link from 'next/link';
import * as Yup from 'yup'
import { ErrorMessage, Field, Formik } from 'formik'

export default function SaveTeacherLayout() {

    const router = useRouter();

    const [teacher, setTeacher] = useState<Teacher>({
        name: "",
        about: "",
        email: "",
        phone: "",
        photo: "",
    });
    const [teacherID, setTeacherID] = useState<string>();
    const [file, setFile] = useState<FileList>();

    const [newTeacher, setNewTeacher] = useState<boolean>(false);


    // setTeacherID(id ? id.toString() : '');

    useEffect(() => {

        const { id } = router.query;
        if (id) {
            if (id.toString() == "new") {
                setNewTeacher(true);
            } else {
                //Recupera o valor do banco de dados
                setNewTeacher(false);
            }
        }



    }, [router.query]);

    const saveTeacher = async (values: Teacher) => {
        try {
            console.log(values)
            console.log(file)


            let data = new FormData();
            data.append('file', file[0]);
            for (let key in values) {
                data.append(key, values[key]);
            }
            // data.append('user', 'hubot');
            // data.append()

            const res = await fetch(APIRoutes.TEACHER, {
                method: 'POST',
                body: data
            });

            const result = await res.json();

            console.log(result);
        } catch (error) {
            console.error(error);
        }
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
                initialValues={{ ...teacher, file: undefined }}
                validationSchema={
                    Yup.object().shape({
                        name: Yup.string().required('Preencha este campo.'),
                        about: Yup.string().required('Preencha este campo.'),
                        photo: Yup.string().required('Preencha este campo.'),
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
                        <button type="submit" className="btn btn-primary mt-3" disabled={isSubmitting}>Salvar</button>
                    </form>
                )}
            </Formik>
        </AdminBase>
    )
}

