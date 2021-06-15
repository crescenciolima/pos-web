import Head from 'next/head'
import style from '../../styles/news.module.css'
import { GetStaticPaths, GetStaticProps } from 'next'
import React from 'react'
import SiteHeader from '../../components/site-header'
import Image from 'next/image'
import NewsService from '../../lib/news.service'
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons'

export default function Docentes({ news }) {


  return (
    <>
      <Head>
        <title>Pos Web</title>
      </Head>
      <SiteHeader></SiteHeader>
      <main className={style.detailNewsMain}>
        <section className="w-100">
          <div className="row h-100 justify-content-center">
            <div className="col-md-5 col-xl-6  d-flex justify-content-center align-items-center">
              <div className={style.detailNewsCard + " card p-4"}>
                <div className="card-body d-relative">
                  <div className="text-center">
                    <Image src={news.coverURL} alt="..." className={style.newsCover + " btn-round mx-auto"} width={170} height={170} loading="lazy"></Image>
                  </div>
                  <h1 className="text-primary-dark heading-font-size text-center mt-5">{news.title}</h1>
                  <div className="mt-5" dangerouslySetInnerHTML={{ __html: news.text }}>

                  </div>
                  <div className="mt-4">
                    <Link href="/">
                      <a className="text-primary">
                        <i className="icon">
                          <FontAwesomeIcon icon={faArrowAltCircleLeft} className="sm-icon" />
                        </i> Voltar
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>


      </main>

    </>
  )
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {

  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: 'blocking' //indicates the type of fallback
  }
}

export const getStaticProps: GetStaticProps = async (context) => {

  const newsService = NewsService();

  const newsSlug = context.params.id;

  const news = await newsService.getBySlug(newsSlug);

  console.log(news)

  return {
    props: {
      news: news
    },
    revalidate: 86400
  }
}
