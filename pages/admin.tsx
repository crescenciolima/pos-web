import Head from 'next/head'
import { GetStaticProps } from 'next'
import React from 'react'
import AdminSidebar from '../components/admin-sidebar'
import adminStyle from '../styles/admin.module.css'
import AdminContent from '../components/admin-content'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

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
                <div className="col-md-9 ms-sm-auto col-lg-9 px-md-4">
                    <div className="text-right p-3 text-primary">
                        <i className={adminStyle.icon}>
                            <FontAwesomeIcon icon={faSignOutAlt} className="sm-icon"/>
                        </i>                     
                        <label className={adminStyle.sidebarLabel}>Sair</label>
                    </div>
                    <AdminContent />
                </div>
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
