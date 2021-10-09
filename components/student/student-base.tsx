import Head from 'next/head';
import { GetServerSidePropsContext, GetStaticProps } from 'next';
import React, { useEffect, useState } from 'react';
import StudentSidebar from './student-sidebar';
import adminStyle from '../../styles/admin.module.css';
import AdminContent from './student-content';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserAlt } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer } from 'react-nextjs-toast';
import { APIRoutes } from '../../utils/api.routes';
import API from '../../lib/api.service';
import Cookies from '../../lib/cookies.service';
import { useRouter } from 'next/router';

export default function StudentBase(props: any) {
  const router = useRouter();
  const api = API();
  const cookie = Cookies();

  const logout = async () => {
    await api.get(APIRoutes.SIGNOUT);
    await cookie.removeToken();
    router.push("/login");
  }

  const profile = async () => {
    router.push("/student/profile");
  }

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
            <StudentSidebar />
            <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
              <div className="text-right p-3 text-primary">
                <i className={adminStyle.icon}>
                  <FontAwesomeIcon icon={faUserAlt} className="sm-icon" />
                </i>
                <label className={adminStyle.sidebarLabel} onClick={() => profile()}>Perfil</label>
                <i className={adminStyle.icon}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="sm-icon" />
                </i>
                <label className={adminStyle.sidebarLabel} onClick={() => logout()}>Sair</label>
              </div>
              <AdminContent>
                {props.children}
              </AdminContent>
            </div>
          </div>
        </div>
      </main>
      <ToastContainer align={"right"} position={"bottom"} />

    </>
  )
}

