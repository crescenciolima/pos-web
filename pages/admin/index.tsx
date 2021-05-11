import Head from 'next/head'
import { GetStaticProps } from 'next'
import React from 'react'
import AdminBase from '../../components/admin-base'

export default function Admin() {
  return (
        <AdminBase />
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
