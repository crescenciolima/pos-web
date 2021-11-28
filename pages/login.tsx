import Head from 'next/head';
import { GetServerSidePropsContext, GetStaticProps, InferGetServerSidePropsType } from 'next';
import React, { useState } from 'react';
import { ErrorMessage, Formik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer } from 'react-nextjs-toast';
import { useRouter } from 'next/router';
import Image from 'next/image'

import style from '../styles/login.module.css';
import SiteHeader from '../components/site-header';
import { UserType } from '../enum/type-user.enum';
import API from '../lib/api.service';
import Cookies from '../lib/cookies.service';
import Permission from '../lib/permission.service';
import { User } from '../models/user';
import { APIRoutes } from '../utils/api.routes';


export default function Login(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [pageName, setPageName] = useState('Login');
    const [pageType, setPageType] = useState('login');
    const router = useRouter();
    const api = API();
    const cookie = Cookies();

    const PAGES = {
        LOGIN: 'login',
        SIGNUP: 'signup',
        FORGOT_PASSWORD: 'forgot-password',
    };


    const buildPage = (): { [key: string]: string; } => {
        return {
            [PAGES.LOGIN]: 'Login',
            [PAGES.SIGNUP]: 'Cadastre-se',
            [PAGES.FORGOT_PASSWORD]: 'Esqueceu a sua senha?',
        };
    };

    const buildButton = (): { [key: string]: string; } => {
        return {
            [PAGES.LOGIN]: 'Entrar',
            [PAGES.SIGNUP]: 'Cadastrar',
            [PAGES.FORGOT_PASSWORD]: 'Enviar e-mail',
        };
    };

    const changePage = (page) => {
        setPageName(buildPage()[page]);
        setPageType(page);
    };

    const redirectAfterLogin = (user: User) => {
        if (user.type === UserType.STUDENT) {
            router.push("/student");
        } else {
            router.push("/admin");
        }
    }

    const signIn = async (values: any) => {
        const response = await api.post(APIRoutes.SIGNIN, values);
        if (response) {
            const user: User = response.result;
            await cookie.setToken(user.token);
            await cookie.setUserName(user.name);
            await cookie.setUserType(user.type);
            redirectAfterLogin(user);
            return;
        }
    }

    const signUp = async (values) => {
        values.type = UserType.STUDENT;
        const result = await api.post(APIRoutes.SIGNUP, values);
        if (result) {
            setPageName(buildPage()[PAGES.LOGIN]);
            setPageType(PAGES.LOGIN);
        }
    }

    const forgotPassword = async (values) => {
        const result = await api.post(APIRoutes.FORGOT_PASSWORD, values);
        if (result) {
            setPageName(buildPage()[PAGES.LOGIN]);
            setPageType(PAGES.LOGIN);
        }
    }

    const onSubmit = async (values: User, actions) => {
        try {
            actions.setSubmitting(true);

            if (pageType === PAGES.LOGIN) {
                await signIn(values);
            } else if (pageType === PAGES.SIGNUP) {
                await signUp(values);
            } else if (pageType === PAGES.FORGOT_PASSWORD) {
                await forgotPassword(values);
            }

        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }

    return (
        <>
            <Head>
                <title>Pos Web - Login</title>
            </Head>
            <SiteHeader></SiteHeader>
            <main className={style.main}>
                <div className={style.formSignin}>
                <Image src="/images/ifba-logo-footer.png" className=" text-center mx-auto" alt="logo"width="120" height="120" />
                    <h1 className="h3 mb-4 fw-normal text-center">{pageName}</h1>
                    <Formik
                        enableReinitialize
                        initialValues={{ name: '', email: '', password: '' }}
                        validationSchema={
                            Yup.object().shape({
                                name: pageType === PAGES.SIGNUP ? Yup.string().required('Preencha este campo.') : null,
                                email: Yup.string().required('Preencha este campo.'),
                                password: pageType === PAGES.LOGIN ? Yup.string().required('Preencha este campo.') : null,
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
                                {pageType === PAGES.SIGNUP && (
                                    <div className="form-floating mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            id="name"
                                            placeholder="Nome Completo"
                                            value={values.name}
                                            onChange={handleChange} />
                                        <p className="input-error"><ErrorMessage name="name" className="input-error" /></p>
                                        <label htmlFor="name" className="form-label">Nome Completo</label>
                                    </div>
                                )}
                                <div className="form-floating mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="email"
                                        id="email"
                                        placeholder="E-mail"
                                        value={values.email}
                                        onChange={handleChange} />
                                    <p className="input-error"><ErrorMessage name="email" className="input-error" /></p>
                                    <label htmlFor="email" className="form-label">E-mail</label>
                                </div>
                                {pageType !== PAGES.FORGOT_PASSWORD && (
                                    <div className="form-floating mb-3">
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            id="password"
                                            placeholder="Senha"
                                            value={values.password}
                                            onChange={handleChange} />
                                        <label htmlFor="password" className="form-label">Senha</label>
                                        <p className="input-error"><ErrorMessage name="password" className="input-error" /></p>
                                    </div>
                                )}
                                <div className="text-right mt-4">
                                    <button type="submit" className="w-100 btn btn-lg btn-primary" disabled={isSubmitting}>{buildButton()[pageType]}</button>
                                </div>
                                <div className="text-center mt-4">
                                    <div className={"mt-1 " + style.buttonSignin}>
                                        <a className="mt-1" onClick={() => changePage(pageType === PAGES.LOGIN ? PAGES.SIGNUP : PAGES.LOGIN)}>
                                            {pageType === PAGES.LOGIN ? 'Cadastre-se' : 'Login'}
                                        </a>
                                    </div>
                                    {pageType === PAGES.LOGIN && (
                                        <div className={style.buttonForgotPassword}>
                                            <a onClick={() => changePage(PAGES.FORGOT_PASSWORD)}>
                                                Esqueci a senha
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </form>
                        )}
                    </Formik>

                </div>
            </main>
            <ToastContainer align={"right"} position={"bottom"} />
        </>
    )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const permission = Permission();
    return await permission.checkPermissionLogin(ctx);
};

