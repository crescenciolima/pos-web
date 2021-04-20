import Head from 'next/head'
import { GetStaticProps } from 'next'
import React from 'react'
import AdminSidebar from '../../components/admin-sidebar'
import adminStyle from '../../styles/admin.module.css'
import AdminContent from '../../components/admin-content'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
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
