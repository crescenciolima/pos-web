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
import Permission from "../../lib/permission.service";

export default function Admin(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
        <AdminBase />
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const permission = Permission();
  return await permission.checkPermission(ctx, [UserType.MASTER, UserType.ADMIN]);
};
