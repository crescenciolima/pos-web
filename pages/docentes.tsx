import Head from 'next/head'
import style from '../styles/docentes.module.css'
import { GetStaticProps } from 'next'
import React from 'react'
import SiteHeader from '../components/site-header'
import { APIRoutes } from '../lib/api.routes'
import Image from 'next/image'
import { Docente } from '../models/docente'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhoneAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import DocenteService from '../lib/docente.service'

export default function Docentes({ docentes }) {

  const listaDocentes: Docente[] = docentes;

  return (
    <>
      <Head>
        <title>Pos Web - Docentes</title>
      </Head>
      <SiteHeader></SiteHeader>
      <main className={style.main}>
        <section>
          <div className="row h-100 justify-content-center">
            <div className="col-md-5 col-xl-4 d-flex justify-content-center align-items-center">
              <div className="p-4">
                <h1 className="text-primary-dark mt-4 title-sm-font-size">Nossa</h1>
                <h1 className="text-primary-dark title-sm-font-size">Equipe</h1>
              </div>
            </div>
            <div className="col-md-5  col-xl-4  d-flex justify-content-center align-items-center">
              <div className="p-4">
                <h5 className="text-primary-dark mt-4">Conheça a equipe de docentes por trás da nossa pós graduação Lato Sensu em Desenvolvimento Web do IFBA - Vitória da Conquista.</h5>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="row h-100 justify-content-center mt-5">
            <div className="col-md-10 col-xl-8">
              <div className="row justify-content-center">
                {listaDocentes.map((docente, i) => {
                  return (
                    <div className="col-sm-2 col-md-3 col-xl-4" key={i}>
                      <div className={style.card + ' card'}>
                        <div className="card-body text-center mb-3">
                          <Image src={docente.fotoUrl} className={style.avatar + ''} alt="Foto do docente" width={150} height={150} />

                          <h5 className="card-title mt-4 text-primary-dark ">{docente.nome}</h5>
                          <p className="card-text mt-4 text-primary-dark ">{docente.sobre}</p>

                          <a target="_blank" rel="noopener noreferrer" href={'tel:'+docente.telefone} className=" mt-4 d-block">
                            <FontAwesomeIcon icon={faPhoneAlt} size="sm" className="sm-icon  mr-2"/>
                            {docente.telefone}
                          </a>

                          <a target="_blank" rel="noopener noreferrer" href={'mailto:'+docente.email} className=" mt-2 d-block">
                            <FontAwesomeIcon icon={faEnvelope} size="sm" className="sm-icon mr-2" />
                            {docente.email}
                          </a>

                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </section>
      </main>

    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const docenteService = DocenteService();

  const docenteList = await docenteService.getAll();

  return {
    props: {
      docentes: docenteList
    },
    revalidate: 33200
  }
}
