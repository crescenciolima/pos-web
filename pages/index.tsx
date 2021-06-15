import Head from 'next/head'
import homeStyle from '../styles/home.module.css'
import Link from 'next/link'
import { GetStaticProps } from 'next'
import React from 'react'
import SiteHeader from '../components/site-header'
import NewsService from '../lib/news.service'
import NewsCard from '../components/news-card'
import { News } from '../models/news'
import fire from '../utils/firebase-util'
import Image from 'next/image'

export default function Home({ newsList }) {
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
                <button type="button" className="btn btn-primary btn-round py-2 px-4 cta-font-size mt-4">Saiba Mais</button>

              </div>
            </div>
            <div className="col-md-6 d-flex justify-content-center align-items-center mh-100">
              <img src="/images/home/home.svg" className="img-fluid w-75" alt="..."></img>
            </div>
          </div>
        </section>
        <section className={homeStyle.sectionPadding}>
          <div className="row justify-content-center">
            <div className="col-12">
              <h1 className="d-inline text-primary-dark heading-font-size">Processo Seletivo</h1>
            </div>
            <div className="col-11 col-md-8 col-lg-6 mt-5">
              <div className="card  btn-round bg-color border-0">
                <div className="card-body d-flex ">
                  <img src="/images/home/unavailable.svg" alt="Nenhum processo seletivo" className={homeStyle.cardImg} width={180} height={180} ></img>
                  <div className="d-flex ms-3 flex-column my-auto">
                    <h5 className="card-title text-primary-dark">Olá,</h5>
                    <p className="card-text text-primary-dark">Infelizmente não estamos com nenhum processo seletivo aberto no momento, quando  um novo processo for iniciado, todas as informações serão divulgadas nesse site.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
        <section className={homeStyle.sectionPadding +' '+ homeStyle.newsSection}>
          <div className="row justify-content-center">
            <div className="col-12">
              <h1 className="d-inline text-primary-dark heading-font-size">Últimas Notícias</h1>
            </div>
          </div>
          <div className="row justify-content-center">
            {newsList.map((news: News, i) => {
              return (
                <div className="col-lg-8 mt-5" key={news.id}>
                  <NewsCard title={news.title} coverURL={news.coverURL} text={news.text} date={news.date} dateString={news.dateString} slug={news.slug}></NewsCard>
                </div>
              )
            })}
          </div>

        </section>
      </main>

    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const newsService = NewsService();
  // const newsList = await newsService.getPage(0);
  const newsList = await newsService.getAll();
  for (let news of newsList) {
    const date = fire.firestore.Timestamp.fromMillis(news.date * 1000).toDate();
    news.dateString = date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }
  console.log(newsList)
  return {
    props: {
      newsList
    },
    revalidate: 1800

  }
}
