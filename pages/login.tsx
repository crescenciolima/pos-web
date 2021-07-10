import Head from 'next/head';
import style from '../styles/login.module.css';
import { GetServerSidePropsContext, GetStaticProps, InferGetServerSidePropsType } from 'next';
import React, { useState } from 'react';
import SiteHeader from '../components/site-header';
import { ErrorMessage, Formik } from 'formik';
import * as Yup from 'yup';
import API from '../lib/api.service';
import Cookies from '../lib/cookies.service';
import Permission from '../lib/permission.service';
import { APIRoutes } from '../lib/api.routes';
import { User } from '../models/user'
import { APIResponse } from '../models/api-response';
import { ToastContainer } from 'react-nextjs-toast';
import { useRouter } from 'next/router';
import { UserType } from '../enum/type-user.enum';
import { authAdmin } from '../utils/firebase-admin';

export default function Login(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [pageName, setPageName] = useState('Login');
    const [pageType, setPageType] = useState('login');
    const router = useRouter();
    const api = API();
    const cookie = Cookies();

    const changePage = () => {
        setPageName( pageName === 'Login' ? 'Cadastre-se' : 'Login');
        setPageType( pageType === 'login' ? 'signup' : 'login');
    };

    const redirectAfterLogin = (type: string) => {
        if(type === UserType.STUDENT){
            router.push("/selective-process");
        }else{            
            router.push("/admin");
        }
    }

    const signIn = async (values: any) => {
        const response: APIResponse = await api.post(APIRoutes.SIGNIN, values);    
        const user: User =  response.result;    
        console.log(user);  
        await cookie.setToken(user.token);
        redirectAfterLogin(user.type);
        return;
    }

    const signUp = async (values) => {
        values.type = UserType.STUDENT;
        const response: APIResponse = await api.post(APIRoutes.SIGNUP, values);
        setPageName('Login');
        setPageType('login');
    }

    const onSubmit = async (values: User, actions) => {
        try {
            actions.setSubmitting(true);
            
            if(pageType === 'login'){     
                await signIn(values);
            } else { 
                await signUp(values);
            }   

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
                    initialValues={{ name: '', email: '', password: ''}}
                    validationSchema={
                        Yup.object().shape({
                            name: pageType !== 'login' ? Yup.string().required('Preencha este campo.') : null,
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
                            {pageType !== 'login' && (<div className="form-floating mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    id="name"
                                    placeholder="Nome Completo"
                                    value={values.name}
                                    onChange={handleChange} />
                                <ErrorMessage name="name" className="input-error" />
                                <label htmlFor="name" className="form-label">Nome Completo</label>
                            </div>)}            
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
                                    type="password"
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
                                <button type="submit" className="w-100 btn btn-lg btn-primary" disabled={isSubmitting}>{pageType === 'login' ? 'Entrar' : 'Cadastrar'}</button>
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

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const permission = Permission();
    return await permission.checkPermissionLogin(ctx);
};
  
