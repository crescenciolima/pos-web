import Head from 'next/head'
import style from '../styles/docentes.module.css'
import { GetStaticProps } from 'next'
import React from 'react'
import SiteHeader from '../components/site-header'
import { ErrorMessage, Formik } from 'formik'
import * as Yup from 'yup'
import API from '../lib/api.service'
import { APIRoutes } from '../lib/api.routes'
import { User } from '../models/user'

export default function Login() {

    const api = API();

    const onSubmit = async (values: User, actions) => {
        console.log(values);
        try {
            actions.setSubmitting(true);
            await api.post(APIRoutes.SIGNUP, values);
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
            <main className={style.main}>
                <section>
                <div className="row h-100 justify-content-center">
                    <div className="col-md-5 col-xl-4 col-xxl-3 d-flex justify-content-center align-items-center">
                    <div className="p-4">
                        <h1 className="text-primary-dark mt-4 title-sm-font-size">Login</h1>
                    </div>
                    </div>
                </div>
                </section>

                <section>
                <div className="row h-100 justify-content-center mt-5 pb-5">
                    <div className="col-11 col-md-10 col-xl-8 col-xxl-7">
                    <div className="row justify-content-center">
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
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">E-mail</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="email"
                                        id="email"
                                        placeholder="E-mail"
                                        value={values.email}
                                        onChange={handleChange} />
                                    <ErrorMessage name="email" className="input-error" />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Senha</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="password"
                                        id="password"
                                        placeholder="Senha"
                                        value={values.password}
                                        onChange={handleChange} />
                                    <ErrorMessage name="password" className="input-error" />
                                </div>
                                <div className="text-right">
                                <button type="submit" className="btn btn-primary mt-3 me-auto" disabled={isSubmitting}>Salvar</button>
                                </div>
                            </form>
                        )}
                    </Formik>
                    </div>
                    </div>

                </div>
                </section>
            </main>
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
  
