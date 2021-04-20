import { GetStaticProps } from 'next'
import React from 'react'
import * as Yup from 'yup'
import {ErrorMessage, Field, Formik} from 'formik'

import AdminBase from '../../../components/admin-base'
import CourseService from '../../../lib/course.service'
import { Course } from "../../../models/course";

export default function Admin() {

  const courseService = CourseService();

  const saveCourse = async (values: Course) => {
    try {
      console.log(values)
      //await courseService.save(values);
      const courseList = courseService.getAll();
      console.log(courseList)
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


  return (    
    <AdminBase>
      <Formik
        enableReinitialize
        initialValues={{
          name: '',
          description: '',
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().required('Preencha este campo.'),
          description: Yup.string().required('Preencha este campo.'),
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
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Salvar</button>
          </form>
        )}
      </Formik>
    </AdminBase>
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
