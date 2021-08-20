import { GetServerSidePropsContext,  InferGetServerSidePropsType } from 'next'
import React from 'react'
import { UserType } from "../../enum/type-user.enum";
import Permission from "../../lib/permission.service";
import StudentBase from "../../components/student/student-base";

export default function Admin(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
        <StudentBase />
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const permission = Permission();
  return await permission.checkPermission(ctx, [UserType.STUDENT]);
};
