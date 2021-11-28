import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import StudentSidebar from './student-sidebar';
import adminStyle from '../../styles/admin.module.css';
import AdminContent from './student-content';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer } from 'react-nextjs-toast';
import { APIRoutes } from '../../utils/api.routes';
import API from '../../lib/api.service';
import Cookies from '../../lib/cookies.service';
import { useRouter } from 'next/router';
import { ClipLoader } from 'react-spinners';
import { css } from "@emotion/core";

export default function StudentBase(props: any) {
  const [ userName, setUserName ] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const api = API();
  const cookie = Cookies();

  const toogleLoading = () => {
    setLoading(false);
  }

  const logout = async () => {
    await api.get(APIRoutes.SIGNOUT);
    await cookie.removeAll();
    router.push("/login");
  }

  const profile = async () => {
    router.push("/student/profile");
  }

  useEffect(() => {   
    const loadData = async () => {
      const name = await cookie.getUserNameClient();
      setUserName(name);
    };      
    loadData();
  }, []);

  const override = css`  
    display: block;
    margin: 0 auto;
  `;

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
      {loading && 
         <div className='mt-15'>
            <ClipLoader color="#34A853" loading={loading} size={50} css={override}/>
        </div>
      }
      <div className={`${loading ? 'hide' : 'show'}`}>
        <main className={`${adminStyle.main} container-fluid`}>
            <div className='row'>
              <div className="col-2  p-0">
                <StudentSidebar toogleLoading={toogleLoading} />
              </div>
              <div className="col-10 p-0">
                <div className="p-3 text-primary row">
                  <div className="col-md-6">
                    <i className={adminStyle.icon}>
                      <FontAwesomeIcon icon={faUserAlt} className="sm-icon" />
                    </i>
                    <label className={adminStyle.currentUser}>Oi, {userName}!</label>
                  </div>
                  <div className="text-right col-md-6">
                    <i className={adminStyle.icon}>
                      <FontAwesomeIcon icon={faUserCircle} className="sm-icon" />
                    </i>
                    <label className={adminStyle.sidebarLabel} onClick={() => profile()}>Perfil</label>
                    <i className={adminStyle.icon}>
                      <FontAwesomeIcon icon={faSignOutAlt} className="sm-icon" />
                    </i>
                    <label className={adminStyle.sidebarLabel} onClick={() => logout()}>Sair</label>
                  </div>
                </div>
                <div className="ms-sm-auto px-md-4 my-4 mx-1">
                  <AdminContent>
                    {props.children}
                  </AdminContent>
                </div>
              </div>
            </div>
        </main>
      </div>
      <ToastContainer align={"right"} position={"bottom"} />

    </>
  )
}

