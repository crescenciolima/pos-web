import Head from 'next/head'
import homeStyle from '../styles/home.module.css'
import { getSortedPostsData } from '../lib/posts'
import Link from 'next/link'
import Date from '../components/date'
import { GetStaticProps } from 'next'
import React from 'react'
import SiteHeader from '../components/site-header'

export default function Home() {
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
        <section className={homeStyle.sectionInicio}>

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
