import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link';
import { GetServerSidePropsContext } from 'next';
import * as Yup from 'yup';
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/core";
import { ErrorMessage, Field, Formik } from 'formik';

import AdminBase from '../../../components/admin/admin-base';
import { APIRoutes } from '../../../utils/api.routes';
import API from '../../../lib/api.service';
import Permission from '../../../lib/permission.service';
import { APIResponse } from '../../../models/api-response';
import { User } from '../../../models/user';
import { UserType } from '../../../enum/type-user.enum';

export default function SaveUserLayout() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const api = API();

    const [user, setUser] = useState<User>({
        name: "",
        email: "",
    });
    const [file, setFile] = useState<FileList>();

    useEffect(() => {
        const { id } = router.query;
        if (id && id.toString() !== "new") {
            getUser(id.toString());
        } else {
            setLoading(false);
        }
    }, [router.query]);

    const getUser = async (id: string) => {
        const result = await api.get(APIRoutes.USER, { 'id': id });
        if(result){
            const user: User = (result as APIResponse).result;
            setUser(user);     
            setLoading(false);  
        }
    }

    const saveUser = async (values: User, actions) => {
        try{
            const result = await api.post(APIRoutes.USER, values);
            if(result){
                router.push("/admin/user");
            }
            actions.setSubmitting(false);
        }catch(e){
            actions.setSubmitting(false);          
        }
    };

    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true);
            await saveUser(values, actions);
        } catch (error) {
            console.error(error, actions);
            actions.setSubmitting(false);
        }
    }
 
    const override = css`  
        display: block;
        margin: 0 auto;
    `;

    if(loading){
        return (
          <AdminBase>
            <div>
              <ClipLoader color="#34A853" loading={loading} size={50} css={override}/>
            </div>
          </AdminBase>
        );
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
                initialValues={{ ...user, type: user.id ? user.type : 'admin'}}
                validationSchema={
                    Yup.object().shape({
                        name: Yup.string().required('Preencha este campo.'),
                        email: Yup.string().required('Preencha este campo.'),
                        type: Yup.string().required('Preencha este campo.'),
                        password: !user.id ? Yup.string().required('Preencha este campo.') : null,
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
                            <p className="input-error"><ErrorMessage name="name"/></p>
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
                            <p className="input-error"><ErrorMessage name="email" /></p>
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
                            <p className="input-error"><ErrorMessage name="type" /></p>
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
                            <p className="input-error"><ErrorMessage name="password" /></p>
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

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const permission = Permission();
    return await permission.checkPermission(ctx, [UserType.MASTER]);
};

