import Image from 'next/image'
import Link from 'next/link';
import React, { useState } from 'react';
import homeStyle from '../styles/home.module.css'

export default function SiteHeaderLogo() {

  const [navBarCollapsed, setNavBarCollapsed] = useState(false);

  function toogleNavBarMenu() {
    setNavBarCollapsed(!navBarCollapsed);
  }

  return (
    <header className={homeStyle.headerBackground}>
      <nav className="navbar  bg-transparent navbar-expand-md">
        <div className="container-fluid mx-1 mx-md-2">
          <Link href="/">
            <a className="navbar-brand">
              <Image src="/images/ifbavca.png" className="d-inline-block align-text-top" alt="Logo do IFBA" width={209} height={60} priority={true} />
            </a>
          </Link>
        </div>
      </nav>
    </header>
  )
}