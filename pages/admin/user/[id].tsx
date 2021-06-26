import React, { useEffect, useState } from 'react'

import AdminBase from '../../../components/admin-base'
import { APIRoutes } from '../../../lib/api.routes'
import { User } from '../../../models/user';
import { useRouter } from 'next/router'
import Link from 'next/link';
import * as Yup from 'yup'
import { ErrorMessage, Field, Formik } from 'formik'
import { toast } from 'react-nextjs-toast'
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';

export default function SaveUserLayout() {

    const router = useRouter();
    const api = API();

    const [user, setUser] = useState<User>({
        name: "",
        email: "",
        type: "",
    });
    const [file, setFile] = useState<FileList>();
    // const [newUser, setNewUser] = useState<boolean>(false);

    useEffect(() => {

        const { id } = router.query;
        if (id) {
            if (id.toString() == "new") {
                // setNewUser(true);
            } else {
                console.log(id);
                getUser(id.toString());
                // setNewUser(false);
            }
        }

    }, [router.query]);

    const getUser = async (id: string) => {
        //Recupera o valor do banco de dados
        const result: APIResponse = await api.get(APIRoutes.USER, { 'id': id });
        const user: User = result.result;
        setUser(user);
    }

    const saveUser = async (values: User) => {
        console.log(values);
        console.log(user);
        api.post(APIRoutes.USER, values);
    };

    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true);
            await saveUser(values);
        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }
 


    return (
        <AdminBase>
            <div className="row mb-3">
                <div className="col-12 text-right">
                    <Link href="/admin/user">
                        <a className="link-primary ">Voltar</a>
                    </Link>
                </div>
            </div>
            <Formik
                enableReinitialize
                initialValues={{ ...user}}
                validationSchema={
                    Yup.object().shape({
                        name: Yup.string().required('Preencha este campo.'),
                        email: Yup.string().required('Preencha este campo.'),
                        type: Yup.string().required('Preencha este campo.'),
                        password: Yup.string().required('Preencha este campo.'),
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
                                placeholder="Nome do usuário"
                                value={values.name}
                                onChange={handleChange} />
                            <ErrorMessage name="name" className="input-error" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">E-mail</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                id="email"
                                placeholder="E-mail"
                                value={values.email}
                                onChange={handleChange} />
                            <ErrorMessage name="email" className="input-error" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="type" className="form-label">Tipo</label>
                            <select 
                                className="form-select form-control" 
                                name="type"
                                id="type"
                                placeholder=""
                                value={values.type}
                                onChange={handleChange}
                            >
                                <option value="admin">Administrativo</option>
                                <option value="master">Master</option>
                            </select>
                            <ErrorMessage name="type" className="input-error" />
                        </div>
                        {!user.id && (<div className="mb-3">
                            <label htmlFor="password" className="form-label">Senha</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                id="password"
                                placeholder="Senha"
                                value={values.password}
                                onChange={handleChange} />
                            <ErrorMessage name="password" className="input-error" />
                        </div>)}
                        <div className="text-right">
                        <button type="submit" className="btn btn-primary mt-3 me-auto" disabled={isSubmitting}>Salvar</button>
                        </div>
                    </form>
                )}
            </Formik>
        </AdminBase>
    )
}

