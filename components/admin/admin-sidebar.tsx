import Image from 'next/image'
import adminStyle from '../../styles/admin.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faBookReader, faChalkboardTeacher, faFile, faFileAlt, faFileInvoice, faFolder, faCopy, faUser } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import Permission from '../../lib/permission.service'
import { UserType } from '../../enum/type-user.enum'

export default function AdminSidebar() {
    //const { userType } = props; 
    return (
        <nav className="col-2 col-lg-2 d-md-block sidebar">
            <div className="d-flex flex-column p-1 p-md-3 text-primary">
                <a className="navbar-brand text-center d-none d-md-inline-block" href="/">
                    <Image src="/images/ifbavca.png" className=" align-text-top" alt="Logo" width={140} height={40} priority={true} />
                </a>
                <a className="navbar-brand text-center mx-0 d-inline-block d-md-none" href="/">
                    <Image src="/images/logo-mobile.png" className=" align-text-top" alt="Logo" width={50} height={55} priority={true} />
                </a>
                <ul className="nav nav-pills flex-column mb-auto text-primary mt-2 mt-md-5 ">
                    <li>
                        <a href="/admin" className={adminStyle.navLink+" nav-link text-primary sidebar-item"}>
                            <i className={adminStyle.icon}>
                                <FontAwesomeIcon icon={faChartLine} className="sm-icon" />
                            </i>
                            <label className={adminStyle.sidebarLabel+" d-none d-md-inline-block"}>Dashboard</label>
                        </a>
                    </li>
                    <li>
                        <a href="/admin/course" className={adminStyle.navLink+" nav-link text-primary"}>
                            <i className={adminStyle.icon}>
                                <FontAwesomeIcon icon={faBookReader} className="sm-icon" />
                            </i>
                            <label className={adminStyle.sidebarLabel+" d-none d-md-inline-block"}>Curso</label>
                        </a>
                    </li>
                    <li>
                        <Link href="/admin/teacher">
                            <a className={adminStyle.navLink+" nav-link text-primary"}>
                                <i className={adminStyle.icon}>
                                    <FontAwesomeIcon icon={faChalkboardTeacher} className="sm-icon" />
                                </i>
                                <label className={adminStyle.sidebarLabel+" d-none d-md-inline-block"}>Docentes</label>
                            </a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/news">
                            <a className={adminStyle.navLink+" nav-link text-primary"}>
                                <i className={adminStyle.icon}>
                                    <FontAwesomeIcon icon={faFile} className="sm-icon" />
                                </i>
                                <label className={adminStyle.sidebarLabel+" d-none d-md-inline-block"}>Posts</label>
                            </a>
                        </Link>
                    </li>
                    <li>
                        <a href="#" className={adminStyle.navLink+" nav-link text-primary"}>
                            <i className={adminStyle.icon}>
                                <FontAwesomeIcon icon={faFileAlt} className="sm-icon" />
                            </i>
                            <label className={adminStyle.sidebarLabel+" d-none d-md-inline-block"}>Trabalhos</label>
                        </a>
                    </li>
                    <li>
                        <a href="#" className={adminStyle.navLink+" nav-link text-primary"}>
                            <i className={adminStyle.icon}>
                                <FontAwesomeIcon icon={faFileInvoice} className="sm-icon" />
                            </i>
                            <label className={adminStyle.sidebarLabel+" d-none d-md-inline-block"}>Baremas</label>
                        </a>
                    </li>
                    <li>
                        <Link href="/admin/selectiveprocess">
                            <a href="#" className={adminStyle.navLink+" nav-link text-primary"}>
                                <i className={adminStyle.icon}>
                                    <FontAwesomeIcon icon={faFolder} className="sm-icon" />
                                </i>
                                <label className={adminStyle.sidebarLabel+" d-none d-md-inline-block"}>Processo Seletivo</label>
                            </a>
                        </Link>

                    </li>
                    <li>
                        <a href="#" className={adminStyle.navLink+" nav-link text-primary"}>
                            <i className={adminStyle.icon}>
                                <FontAwesomeIcon icon={faCopy} className="sm-icon" />
                            </i>
                            <label className={adminStyle.sidebarLabel+" d-none d-md-inline-block"}>Relatórios</label>
                        </a>
                    </li>
                    <li>
                        <a href="/admin/user" className={adminStyle.navLink+" nav-link text-primary"}>
                            <i className={adminStyle.icon}>
                                <FontAwesomeIcon icon={faUser} className="sm-icon" />
                            </i>
                            <label className={adminStyle.sidebarLabel+" d-none d-md-inline-block"}>Usuários</label>
                        </a>
                    </li>
                </ul>
            </div>
        </nav>

      
    )
}