import { authAdmin } from "./../../utils/firebase-admin";
import { GetStaticProps, GetServerSidePropsContext,  InferGetServerSidePropsType } from 'next'
import React from 'react'
import AdminBase from '../../components/admin-base'
import Cookies from '../../lib/cookies.service';
import API from "../../lib/api.service";
import { APIRoutes } from "../../lib/api.routes";
import { APIResponse } from "../../models/api-response";
import { User } from "../../models/user";
import { UserType } from "../../enum/type-user.enum";
import { useRouter } from "next/router";

export default function Admin(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  console.log(props);
  return (
        <AdminBase />
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const cookie = Cookies();
    const token = await cookie.getTokenServer(ctx);
    await authAdmin.verifyIdToken(token);
    
    const api = API();
    const response: APIResponse = await api.get(APIRoutes.CURRENT_USER);    
    const user: User =  response.result;   
    console.log(user);  

    if([UserType.MASTER, UserType.ADMIN].includes(user.type as UserType)){
      return {
        props: { message: `Authorized.` },
      };
    }

    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
      props: {} as never,
    };

  } catch (err) {
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
      props: {} as never,
    };
  }
};
