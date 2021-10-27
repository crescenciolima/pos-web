import Image from 'next/image'
import Link from 'next/link';
import React, { useState } from 'react';
import homeStyle from '../styles/home.module.css'

export default function SiteHeader() {

  const [navBarCollapsed, setNavBarCollapsed] = useState(false);

  function toogleNavBarMenu() {
    setNavBarCollapsed(!navBarCollapsed);
  }

  return (
    <header className={homeStyle.headerBackground}>
      <nav className="navbar  bg-white navbar-expand-md">
        <div className="container-fluid mx-1 mx-md-2">
          <Link href="/">
            <a className="navbar-brand">
              <Image src="/images/ifbavca.png" className="d-inline-block align-text-top" alt="Logo do IFBA" width={209} height={60} priority={true} />
            </a>
          </Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <label className={" navbar-toggler menu " + (!navBarCollapsed ? 'collapsed' : '')} data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Menu de navegação">
            <input type="checkbox" onClick={toogleNavBarMenu}></input>
            <div></div>
            <div></div>
            <div></div>
          </label>
          <div className={"collapse navbar-collapse justify-content-end " + (navBarCollapsed ? 'show' : '')} id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link href="/">
                  <a className="nav-link">Início</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/noticia">
                  <a className="nav-link">Notícias</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/docentes">
                  <a className="nav-link">Docentes</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/trabalhos">
                  <a className="nav-link">Trabalhos</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/login">
                  <a className={"nav-link " + homeStyle.login}>Entrar</a>
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </nav>
    </header>
  )
}