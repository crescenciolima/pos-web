import Head from 'next/head'
import { GetStaticProps } from 'next'
import React from 'react'
import AdminSidebar from '../components/admin-sidebar'
import adminStyle from '../styles/admin.module.css'
import AdminContent from '../components/admin-content'

export default function Admin() {
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
      <main className={adminStyle.main}>
        <div className="container-fluid">
            <div className='row'>                
                <AdminSidebar />
                <AdminContent />
            </div>
        </div>
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
