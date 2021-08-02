import { GetServerSidePropsContext, GetStaticProps, InferGetServerSidePropsType } from 'next'
import React, {useEffect, useState, useRef} from 'react'
import * as Yup from 'yup'
import {ErrorMessage, Field, Formik} from 'formik'
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/core";

import AdminBase from '../../../components/admin-base';
import { Course } from "../../../models/course";
import { APIRoutes } from '../../../lib/api.routes';
import API from '../../../lib/api.service';
import Cookies from '../../../lib/cookies.service';
import { authAdmin } from '../../../utils/firebase-admin';
import Permission from '../../../lib/permission.service';
import { UserType } from '../../../enum/type-user.enum';

interface CourseProps{
  course: Course;
}

export default function CourseLayout({course}: CourseProps, props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [loading, setLoading] = useState(true);
  const [courseObject, setCourseObject] = useState(course);
  const [reload, setReload] = useState(true);
  const api = API(setLoading);

  const saveCourse = async (values: Course) => {
    try {
      if(courseObject){
        values = {...values, id: courseObject.id};
      }
      
      const result = await api.post(APIRoutes.COURSE, values);

      setReload(!reload);
      console.log(result)
    } catch (error) {
      console.error(error);
    }
  };
  
  const onSubmit = async (values, actions) => {
    try {
      actions.setSubmitting(true);
      await saveCourse(values);
    } catch (error) {
      console.error(error);
      actions.setSubmitting(false);
    }
  }

  useEffect(() => {
    const loadCourse = async () => {
      const result = await api.get(APIRoutes.COURSE);
      setCourseObject(result[0] ?? result[0]);
      setLoading(false);
    };

    loadCourse();
  }, [reload]);

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
      <Formik
        enableReinitialize
        initialValues={{
          name: courseObject ? courseObject.name : '',
          description: courseObject ? courseObject.description : '',
          coordName: courseObject ? courseObject.coordName: '',
          coordMail: courseObject ? courseObject.coordMail: '',
          coordPhone: courseObject ? courseObject.coordPhone: '',
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().required('Preencha este campo.'),
          description: Yup.string().required('Preencha este campo.'),
          coordName: Yup.string().required('Preencha este campo.'),
          coordMail: Yup.string().required('Preencha este campo.'),
          coordPhone: Yup.string().required('Preencha este campo.'),
        })}
        onSubmit={onSubmit}>
        {({
          values, 
          isSubmitting, 
          handleSubmit,
          handleChange
        }) => (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Nome</label>
              <input 
                type="text" 
                className="form-control" 
                name="name" 
                id="name" 
                placeholder="Nome do curso"
                value={values.name}                
                onChange={handleChange} />                
              <ErrorMessage name="name" className="input-error" />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Descrição</label>
              <textarea 
                className="form-control" 
                name="description" 
                id="description" 
                rows={3}
                value={values.description}             
                onChange={handleChange}
              ></textarea>
              <ErrorMessage name="description" className="input-error" />
            </div>
            <div>
              <label htmlFor="coordName" className="form-label">Nome do coordenador</label>
              <input 
                type="text" 
                className="form-control" 
                name="coordName" 
                id="coordName" 
                placeholder="Nome do coordenador"
                value={values.coordName}                
                onChange={handleChange} /> 
              <ErrorMessage name="coordName" className="input-error" />
            </div>
            <div>
              <label htmlFor="coordName" className="form-label">E-mail</label>
              <input 
                type="email" 
                className="form-control" 
                name="coordMail" 
                id="coordMail" 
                placeholder="E-mail do coordenador"
                value={values.coordMail}                
                onChange={handleChange} /> 
              <ErrorMessage name="coordMail" className="input-error" />
            </div>
            <div>
              <label htmlFor="coordName" className="form-label">Telefone</label>
              <input 
                type="tel" 
                className="form-control" 
                name="coordPhone" 
                id="coordPhone" 
                placeholder="Número de telefone do coordenador"
                value={values.coordPhone}                
                onChange={handleChange} /> 
              <ErrorMessage name="coordPhone" className="input-error" />
            </div>
            <br />
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Salvar</button>
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

