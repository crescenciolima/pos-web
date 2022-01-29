import Head from 'next/head'
import { GetStaticProps } from 'next'
import React from 'react'
import SiteHeader from '../../components/site-header'
import WorksCard from '../../components/work-card'
import { Works } from '../../models/works'
import style from '../../styles/news.module.css'
import { CourseService } from '../../lib/course.service';
import { Course } from '../../models/course'
import SiteFooter from '../../components/site-footer'
import { format } from 'date-fns';
import { WorksService } from '../../lib/works.service'

export default function Trabalhos({ worksList, course }) {

  return (
    <>
      <Head>
        <title>Pos Web - Docentes</title>
      </Head>
      <SiteHeader></SiteHeader>
      {/* className={style.main} */}
      <main className={style.main}>
        <section  className="title-section">
          <div className="row h-100 justify-content-center w-100">
            <div className="col-md-5 col-xl-4 col-xxl-3 d-flex justify-content-center align-items-center">
            <div className="px-5 py-2 py-md-4">
                <h1 className="text-primary-dark mt-4 title-sm-font-size">Trabalhos</h1>
              </div>
            </div>
            <div className="col-md-5 col-xl-4 col-xxl-3 d-flex justify-content-center align-items-center">
            <div className="px-5 py-2 py-md-4">
                <h5 className="text-primary-dark mt-4">Veja os trabalhos acadêmicos dos nossos discentes.</h5>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="row justify-content-center pb-5 w-100">
            {worksList && worksList.map((works: Works, i) => {
              return (
                <div className="col-11 col-lg-8 mt-5" key={works.id}>
                  <WorksCard work={works}/>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <SiteFooter course={course}></SiteFooter>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const worksService = new WorksService();
  const worksList = await worksService.getAll();
  const courseService = new CourseService();

  let courseData = await courseService.getFirstCourse();

  //mockup de dados quando não houver cadastro do curso 
  //TODO melhor retornar um componente vazio e não renderizar a seção "Sobre"?
  let course: Course = {
    name: '<Nome do Curso>',
    description: '<Descrição do Curso>',
    coordName: '<Nome do Coordenador>',
    coordMail: '<E-mail da Coordenação>',
    coordPhone: '<Telefone da Coordenação>'
  }

  if (courseData) {
    course = courseData
  }

  return {
    props: {
      worksList: JSON.parse(JSON.stringify(worksList)),
      course: JSON.stringify(course)
    },
    revalidate: 86400
  }
}
