import Head from 'next/head'
import homeStyle from '../../styles/home.module.css'
import React from 'react'
import SiteHeaderLogo from '../../components/site-header-logo'

export default function NotAuthorized() {
  
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
      <SiteHeaderLogo></SiteHeaderLogo>
      <main className={homeStyle.main}>
        <section className={homeStyle.sectionInicio}>

          <div className="row h-100">
            <div className="col-md-6 d-flex justify-content-center align-items-center">
              <div className="p-4">
                <h1 className="d-inline text-primary-dark title-sm-font-size">Acesso</h1>
                <h1 className="d-inline text-primary-dark fw-bold title-sm-font-size" > não autorizado</h1>
                <h1 className="text-primary-dark mt-4 title-font-size">
                    Você não possui permissão para acessar essa página.
                </h1>
                <a className="d-inline text-primary-dark"  href="/login">Voltar</a>
              </div>
            </div>
            <div className="col-md-6 d-flex justify-content-center align-items-center mh-100">
              <img src="/images/unauthorized.svg" className="img-fluid w-75" alt="..."></img>
            </div>
          </div>
        </section>
      </main>

    </>
  )
}
