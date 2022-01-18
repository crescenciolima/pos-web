import Head from 'next/head'
import { GetStaticProps } from 'next'
import React from 'react'
import SiteHeader from '../../components/site-header'
import NewsCard from '../../components/news-card'
import { News } from '../../models/news'
import style from '../../styles/news.module.css'
import { CourseService } from '../../lib/course.service';
import { Course } from '../../models/course'
import SiteFooter from '../../components/site-footer'
import { format } from 'date-fns';
import { NewsService } from '../../lib/news.service'

export default function Noticias({ newsList, course }) {

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
                <h1 className="text-primary-dark mt-4 title-sm-font-size">Notícias</h1>
              </div>
            </div>
            <div className="col-md-5 col-xl-4 col-xxl-3 d-flex justify-content-center align-items-center">
            <div className="px-5 py-2 py-md-4">
                <h5 className="text-primary-dark mt-4">Acompanhe aqui os resultados, editais e informações sobre o processo seletivo.</h5>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="row justify-content-center pb-5 w-100">
            {newsList && newsList.map((news: News, i) => {
              return (
                <div className="col-11 col-lg-8 mt-5" key={news.id}>
                  <NewsCard title={news.title} coverURL={news.coverURL} text={news.text} date={news.date} dateString={news.dateString} slug={news.slug}></NewsCard>
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

  const newsService = new NewsService();
  const newsList = await newsService.getAll();

  for (let news of newsList) {
    try {
      news.dateString = format(new Date(news.date), 'dd/MM/yyyy')
    } catch (error) {
      news.dateString = "-"
    }
  }

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
      newsList: newsList,
      course: course
    },
    revalidate: 600
  }
}
