import { authAdmin } from "./../../utils/firebase-admin";
import { GetStaticProps, GetServerSidePropsContext,  InferGetServerSidePropsType } from 'next'
import React from 'react'
import AdminBase from '../../components/admin-base'
import Cookies from '../../lib/cookies.service';

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
    return {
      props: { message: `Authorized.` },
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
