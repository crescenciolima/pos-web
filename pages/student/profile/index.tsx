import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link';
import { GetServerSidePropsContext } from 'next';
import * as Yup from 'yup';
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/core";
import { ErrorMessage, Formik } from 'formik';

import { APIRoutes } from '../../../utils/api.routes';
import API from '../../../lib/api.service';
import Permission from '../../../lib/permission.service';
import { APIResponse } from '../../../models/api-response';
import { User } from '../../../models/user';
import { UserType } from '../../../enum/type-user.enum';
import StudentBase from '../../../components/student/student-base';

export default function ProfileLayout() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const api = API();

    const [user, setUser] = useState<User>({
        name: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        getCurrentUser();
    }, [router.query]);

    const getCurrentUser = async () => {
        const result = await api.get(APIRoutes.CURRENT_USER);        
        if(result){
            const user: User = (result as APIResponse).result;
            setUser(user);     
            setLoading(false);  
        }
    }

    const saveUser = async (values: User, actions) => {
        try{
            const result = await api.post(APIRoutes.USER_PROFILE, values);
            actions.setSubmitting(false);
            router.push("/student");
        }catch(e){
            actions.setSubmitting(false);          
        }
    };

    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true);
            await saveUser({...user, name: values.name, password: values.password}, actions);
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
          <StudentBase>
            <div>
              <ClipLoader color="#34A853" loading={loading} size={50} css={override}/>
            </div>
          </StudentBase>
        );
    }

    return (
        <StudentBase>
            <div className="row mb-3">
                <div className="col-12 text-right">
                    <Link href="/student">
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
                                onChange={handleChange} 
                                disabled={true}/>
                            <p className="input-error"><ErrorMessage name="email" /></p>
                        </div>
                        <div className="mb-3">
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
                        </div>
                        <div className="text-right">
                        <button type="submit" className="btn btn-primary mt-3 me-auto" disabled={isSubmitting}>Salvar</button>
                        </div>
                    </form>
                )}
            </Formik>
        </StudentBase>
    )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const permission = Permission();
    return await permission.checkPermission(ctx, [UserType.STUDENT]);
};

