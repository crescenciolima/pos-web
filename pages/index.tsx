import Head from 'next/head'
import homeStyle from '../styles/home.module.css'
import Link from 'next/link'
import { GetStaticProps } from 'next'
import React, { useRef } from 'react'
import SiteHeader from '../components/site-header'
import NewsCard from '../components/news-card'
import { News } from '../models/news'
import { Course } from '../models/course'
import SiteFooter from '../components/site-footer'
import { format } from 'date-fns';
import { CourseService } from '../lib/course.service'
import { NewsService } from '../lib/news.service'
import { SelectiveProcessService } from '../lib/selectiveprocess.service'
import { ProcessStepsState } from '../models/subscription-process/process-steps-state.enum'
import { ProcessStepsTypes } from '../models/subscription-process/process-steps-types.enum'



export default function Home({ newsList, course, hasOpenProcess, title, acceptingSubscription, subscriptionDate, editalURL }) {

  const infoRef = useRef(null)
  const scrollToInfo = () => infoRef.current.scrollIntoView();

  return (
    <>
      <Head>
        <title>Pos Web</title>
        <link rel="icon" href="favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="X-UA-Compatible" content="IE=edge" />
        <meta name="description" content=" " />
        <meta name="keywords" content="vitória da conquista" />
        <meta name="LANGUAGE" content="pt-br" />
        <meta name="ROBOT" content="Index,Follow" />
        <meta name="author" content="" />
      </Head>
      <SiteHeader></SiteHeader>
      <main className={homeStyle.main}>
        <section className={homeStyle.homeSection}>

          <div className="row h-100">
            <div className="col-md-6 d-flex justify-content-center align-items-center">
              <div className="p-4">
                <h1 className="d-inline text-primary-dark title-sm-font-size">Pós Graduação </h1>
                <h1 className="d-inline text-primary fw-bold title-sm-font-size" >IFBA</h1>
                <h1 className="text-primary-dark mt-4 title-font-size">Lato Sensu em</h1>
                <h1 className="text-primary-dark title-font-size">Desenvolvimento Web</h1>
                <button type="button" className="btn btn-primary btn-round py-2 px-4 cta-font-size mt-4" onClick={scrollToInfo}>Saiba Mais</button>

              </div>
            </div>
            <div className="col-md-6 d-flex justify-content-center align-items-center mh-100">
              <img src="/images/home/home.svg" className="img-fluid w-75" alt="..."></img>
            </div>
          </div>
        </section>
        <section className={homeStyle.sectionPadding} ref={infoRef}>
          {!hasOpenProcess &&
            <div className="row justify-content-center">
              <div className="col-12">
                <h1 className="d-inline text-primary-dark heading-font-size">Processo Seletivo</h1>
              </div>
              <div className="col-11 col-md-10 col-xxl-6 mt-5">
                <div className="card  btn-round bg-color border-0">
                  <div className="card-body d-flex flex-column flex-md-row">
                    <img src="/images/home/unavailable.svg" alt="Nenhum processo seletivo" className={homeStyle.cardImg} width={180} height={180} ></img>
                    <div className="d-flex ms-3 flex-column mt-3 my-md-auto">
                      <h5 className="card-title text-primary-dark">Olá,</h5>
                      <p className="card-text text-primary-dark">Infelizmente não estamos com nenhum processo seletivo aberto no momento, quando  um novo processo for iniciado, todas as informações serão divulgadas nesse site.</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          }
          {hasOpenProcess && <div className="row justify-content-center">
            <div className="col-12">
              <h1 className="d-inline text-primary-dark heading-font-size">Processo Seletivo {acceptingSubscription && 'Aberto'}</h1>
            </div>
            <div className="col-11 col-md-10 col-xxl-6 mt-5">
              <div className="card  btn-round bg-color border-0">
                <div className="card-body d-flex flex-column flex-md-row">
                  <img src="/images/home/available.svg" alt="Processo seletivo aberto" className={homeStyle.cardImg} width={180} height={180} ></img>
                  <div className="d-flex ms-3 flex-column mt-3 my-md-auto">
                    <h3 className="card-title text-primary-dark mb-3">{title}</h3>
                    {!acceptingSubscription &&
                      <p className="card-text text-primary-dark">
                        Estamos com nosso processo seletivo em andamento, acompanhe todas as informações na nossa seção de notícias. Se você é inscrito faça login na plataforma para mais detalhes.
                      </p>}
                    {acceptingSubscription &&
                      <>
                        <p className="card-text text-primary-dark">
                          <b>Anteção. </b> Inscrições abertas para nosso processo seletivo, fique atento para não perder o prazo (Incrições até <b>{subscriptionDate}</b>). Você pode se inscrever clicando no botão abaixo. <a href={editalURL} target="_blank" className="link-primary ms-1">Confira o <b>EDITAL</b> clicando aqui!</a>
                        </p>
                        <div className="row">
                          <div className="col-auto mt-3">
                            <Link href="/login">
                              <button type="button" className="btn btn-primary btn-round px-5 py-2 my-auto">Inscreva-se</button>
                            </Link>

                          </div>
                        </div>
                      </>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
          }
        </section>
        <section className={homeStyle.sectionPadding + ' ' + homeStyle.newsSection}>
          <div className="row justify-content-center">
            <div className="col-12">
              <h1 className="d-inline text-primary-dark heading-font-size">Últimas Notícias</h1>
            </div>
          </div>
          <div className="row justify-content-center">
            {newsList && newsList.map((news: News, i) => {
              return (
                <div className="col-lg-8 mt-5" key={news.id}>
                  <NewsCard title={news.title} coverURL={news.coverURL} text={news.text} date={news.date} dateString={news.dateString} slug={news.slug}></NewsCard>
                </div>
              )
            })}
          </div>

        </section>

        <SiteFooter course={course}></SiteFooter>
      </main>

    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  //Recuperando as ultimas notícias
  const newsService = new NewsService();
  let newsList:any[] = await newsService.getFirstResults();
  for (let i = 0; i < newsList.length; i++) {
    let news = newsList[i];
    try {
      news.dateString = format(new Date(news.date), 'dd/MM/yyyy')
    } catch (error) {
      news.dateString = "-"
    }
    newsList[i] = Object.assign({}, news);
  }

  //Recuperando dados do curso
  const courseService = new CourseService();
  let courseData = await courseService.getFirstCourse();
  let course:any = {
    name: '<Nome do Curso>',
    description: '<Descrição do Curso>',
    coordName: '<Nome do Coordenador>',
    coordMail: '<E-mail da Coordenação>',
    coordPhone: '<Telefone da Coordenação>'
  }
  if (courseData) {
    course = courseData
  }

  

  //Recuperando dados do processo seletivo
  const processService = new SelectiveProcessService();
  const process = await processService.getOpen();
  let title = "", subscriptionDate = "", editalURL = "";
  let hasOpenProcess = false, acceptingSubscription = false;
  if (process) {
    if (process.state == ProcessStepsState.OPEN) {
      hasOpenProcess = true;
      title = process.title;
      const currentStep = process.steps[process.currentStep];
      if (currentStep.type == ProcessStepsTypes.INSCRICAO) {
        acceptingSubscription = true;
        const date = new Date(currentStep.finishDate);
        subscriptionDate = format(date, 'dd/MM/yyyy');
      }

      //Edital
      editalURL = process.processNotices[process.processNotices.length - 1].url;
    }
  }

  course = JSON.stringify(course);

  return {
    props: {
      newsList,
      course,
      hasOpenProcess,
      title,
      acceptingSubscription,
      subscriptionDate,
      editalURL
    },
    revalidate: 600
  }
}
