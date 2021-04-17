import Image from 'next/image'
import { useState } from 'react';
import homeStyle from '../styles/home.module.css'

export default function SiteHeader() {

  const [navBarCollapsed, setNavBarCollapsed] = useState(false);

  function toogleNavBarMenu() {
    console.log(navBarCollapsed)
    setNavBarCollapsed(!navBarCollapsed);
  }

  return (
    <header className={homeStyle.headerBackground}>
      <nav className="navbar  bg-transparent navbar-expand-md">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            <Image src="/images/ifbavca.png" className="d-inline-block align-text-top" alt="Logo" width={209} height={60} priority={true} />
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <label   className={ " navbar-toggler menu " + (!navBarCollapsed ? 'collapsed' : '') } data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Menu de navegação">
            <input type="checkbox" onClick={toogleNavBarMenu}></input>
              <div></div>
              <div></div>
              <div></div>
            </label>
            <div className={"collapse navbar-collapse justify-content-end " + (navBarCollapsed ? 'show' : '')} id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a className="nav-link" aria-current="page" href="#">Notícias</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">Sobre</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">Docentes</a>
                </li>

              </ul>
            </div>
        </div>
      </nav>
    </header>
  )
}