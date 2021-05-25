import Head from 'next/head'
import style from '../styles/login.module.css'
import { GetStaticProps } from 'next'
import React, { useState } from 'react'
import SiteHeader from '../components/site-header'
import { ErrorMessage, Formik } from 'formik'
import * as Yup from 'yup'
import API from '../lib/api.service'
import { APIRoutes } from '../lib/api.routes'
import { User } from '../models/user'
import { APIResponse } from '../models/api-response';
import Image from 'next/image'
import { ToastContainer } from 'react-nextjs-toast'

export default function Login() {
    const [pageName, setPageName] = useState('Login');
    const [pageType, setPageType] = useState('login');

    const api = API();

    const changePage = () => {
        setPageName( pageName === 'Login' ? 'Cadastre-se' : 'Login');
        setPageType( pageType === 'login' ? 'signup' : 'login');
    };

    const onSubmit = async (values: User, actions) => {
        console.log(values);
        try {
            actions.setSubmitting(true);
            const response: APIResponse = pageType === 'login' ? await api.post(APIRoutes.SIGNIN, values) :  await api.post(APIRoutes.SIGNUP, values);
            console.log(response);
            //await api.post(APIRoutes.SIGNIN, values) 
        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }

    return (
        <>
            <Head>
                <title>Pos Web - Docentes</title>
            </Head>
            <SiteHeader></SiteHeader>
            <main className={style.formSignin}>                
                <h1 className="h3 mb-3 fw-normal text-center">{pageType === 'login' ? 'Login' : 'Cadastre-se'}</h1>
                <Formik
                    enableReinitialize
                    initialValues={{ email: '', password: ''}}
                    validationSchema={
                        Yup.object().shape({
                            email: Yup.string().required('Preencha este campo.'),
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
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    name="email"
                                    id="email"
                                    placeholder="E-mail"
                                    value={values.email}
                                    onChange={handleChange} />
                                <ErrorMessage name="email" className="input-error" />
                                <label htmlFor="email" className="form-label">E-mail</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    name="password"
                                    id="password"
                                    placeholder="Senha"
                                    value={values.password}
                                    onChange={handleChange} />
                                <label htmlFor="password" className="form-label">Senha</label>
                                <ErrorMessage name="password" className="input-error" />
                            </div>
                            <div className="text-right">
                                <button type="submit" className="w-100 btn btn-lg btn-primary" disabled={isSubmitting}>Entrar</button>
                            </div>
                            <div className="text-center">
                                <a onClick={() => changePage()}>
                                    {pageType === 'login' ? 'Cadastre-se' : 'Login'}
                                </a>
                            </div>
                        </form>
                    )}
                </Formik>
            </main>
            <ToastContainer align={"right"} position={"bottom"} />
        </>
        )
}

export const getStaticProps: GetStaticProps = async () => {
    const allPostsData = []
    return {
      props: {
        allPostsData
      }
    }
  }
  
