import Head from 'next/head';
import { GetServerSidePropsContext, GetStaticProps, InferGetServerSidePropsType } from 'next';
import React, { useEffect, useState } from 'react';
import { ErrorMessage, Formik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer } from 'react-nextjs-toast';
import { useRouter } from 'next/router';
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/core";

import style from '../styles/login.module.css';
import SiteHeader from '../components/site-header';
import API from '../lib/api.service';
import Cookies from '../lib/cookies.service';
import Permission from '../lib/permission.service';
import { User } from '../models/user';
import { UserType } from '../enum/type-user.enum';
import { APIRoutes } from '../utils/api.routes';

export default function ResetPassword(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const [loading, setLoading] = useState(true);
    const [expiredCode, setExpiredCode] = useState(false);
    const [email, setEmail] = useState(null);
    const router = useRouter();
    const api = API(setLoading);
    const cookie = Cookies();
    const mode = router.query.mode;
    const code = router.query.oobCode;

    useEffect(() => {
        const verifyCode = async () => {
          const response: any = await api.post(APIRoutes.VERIFY_CODE, {code: code});
          if(!response){
            setExpiredCode(true);
          }else{
            setEmail(response.result.email);
          }
          setLoading(false);
        };
    
        verifyCode();
    }, []);


    const redirectToLogin = () => {
        router.push("/login");
    }

    const confirmPasswordReset = async (values: any) => {
        const response = await api.post(APIRoutes.RESET_PASSWORD, values);            
        if(response){
            redirectToLogin();
            return;
        }
    }

    const onSubmit = async (values: User, actions) => {
        try {
            actions.setSubmitting(true);            
            await confirmPasswordReset({...values, code: code});

        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }

    const override = css`  
    display: block;
    margin: 0 auto;
`;

if(loading){
    return (
        <>
            <Head>
                <title>Pos Web - Docentes</title>
            </Head>
            <SiteHeader></SiteHeader>
            <main className={style.formSignin}>                
                <div>
                    <ClipLoader color="#34A853" loading={loading} size={50} css={override}/>
                </div>
            </main>
        </>

    );
}

return (
    <>
        <Head>
            <title>Pos Web - Docentes</title>
        </Head>
        <SiteHeader></SiteHeader>
        <main className={style.formSignin}>                
            <h1 className="h3 mb-3 fw-normal text-center">Recuperar Senha</h1>
            { email && 
                <Formik
                    enableReinitialize
                    initialValues={{ name: '', email: email, password: ''}}
                    validationSchema={
                        Yup.object().shape({
                            password: Yup.string().required('Preencha este campo.')
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
                                    onChange={handleChange} 
                                    disabled/>
                                <label htmlFor="email" className="form-label">E-mail</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input
                                    type="password"
                                    className="form-control"
                                    name="password"
                                    id="password"
                                    placeholder="Nova senha"
                                    value={values.password}
                                    onChange={handleChange} />
                                <label htmlFor="password" className="form-label">Nova senha</label>
                                <p className="input-error"><ErrorMessage name="password" className="input-error" /></p>
                            </div>
                            <div className="text-right">
                                    <button type="submit" className="w-100 btn btn-lg btn-primary" disabled={isSubmitting}>Salvar</button>
                            </div>
                        </form>
                    )}
                </Formik> 
            }
            { expiredCode && 
                <div>
                    O link de recuperação está expirado. Solicite novamente a recuperação de senha.
                </div>
            }
        </main>
        <ToastContainer align={"right"} position={"bottom"} />
    </>
    )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const permission = Permission();
    return await permission.checkPermissionLogin(ctx);
};
  
