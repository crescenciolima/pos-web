import Image from 'next/image'
import adminStyle from '../../styles/admin.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDotCircle, faChalkboardTeacher, faGraduationCap,  faChartBar,  faUser, faSchool, faNewspaper, faFileAlt } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { UserType } from '../../enum/type-user.enum'
import { useEffect, useState } from 'react'
import Cookies from '../../lib/cookies.service'

export default function AdminSidebar() {
    const [ userType, setUserType ] = useState('');
    const cookie = Cookies();

    useEffect(() => {   
        const loadData = async () => {
          const type = await cookie.getUserTypeClient();
          setUserType(type);
        };      
        loadData();
      }, []);

    return (
        <nav className="d-md-block sidebar">
            <div className="d-flex flex-column p-1 p-md-3 text-primary">
                <a className="navbar-brand text-center d-none d-md-inline-block" href="/">
                    <Image src="/images/ifbavca.png" className=" align-text-top" alt="Logo" width={140} height={40} priority={true} />
                </a>
                <a className="navbar-brand text-center mx-0 d-inline-block d-md-none" href="/">
                    <Image src="/images/logo-mobile.png" className=" align-text-top" alt="Logo" width={50} height={55} priority={true} />
                </a>
                <ul className="nav nav-pills flex-column mb-auto text-primary mt-2 mt-md-5 ">
                    <li>
                        <Link href="/admin">
                            <a className={adminStyle.navLink + " nav-link text-primary sidebar-item"}>
                                <i className={adminStyle.icon}>
                                    <FontAwesomeIcon icon={faDotCircle} className="sm-icon" />
                                </i>
                                <label className={adminStyle.sidebarLabel + " d-none d-md-inline-block"}>Dashboard</label>
                            </a>
                        </Link>

                    </li>
                    <li>
                        <Link href="/admin/course">

                            <a className={adminStyle.navLink + " nav-link text-primary"}>
                                <i className={adminStyle.icon}>
                                    <FontAwesomeIcon icon={faSchool} className="sm-icon" />
                                </i>
                                <label className={adminStyle.sidebarLabel + " d-none d-md-inline-block"}>Curso</label>
                            </a>
                        </Link>

                    </li>
                    <li>
                        <Link href="/admin/teacher">
                            <a className={adminStyle.navLink + " nav-link text-primary"}>
                                <i className={adminStyle.icon}>
                                    <FontAwesomeIcon icon={faChalkboardTeacher} className="sm-icon" />
                                </i>
                                <label className={adminStyle.sidebarLabel + " d-none d-md-inline-block"}>Docentes</label>
                            </a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/news">
                            <a className={adminStyle.navLink + " nav-link text-primary"}>
                                <i className={adminStyle.icon}>
                                    <FontAwesomeIcon icon={faNewspaper} className="sm-icon" />
                                </i>
                                <label className={adminStyle.sidebarLabel + " d-none d-md-inline-block"}>Posts</label>
                            </a>
                        </Link>
                    </li>                    
                    <li>
                        <Link href="/admin/works">
                            <a className={adminStyle.navLink + " nav-link text-primary"}>
                                <i className={adminStyle.icon}>
                                    <FontAwesomeIcon icon={faFileAlt} className="sm-icon" />
                                </i>
                                <label className={adminStyle.sidebarLabel + " d-none d-md-inline-block"}>Trabalhos</label>
                            </a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/selectiveprocess">
                            <a className={adminStyle.navLink + " nav-link text-primary"}>
                                <i className={adminStyle.icon}>
                                    <FontAwesomeIcon icon={faGraduationCap} className="sm-icon" />
                                </i>
                                <label className={adminStyle.sidebarLabel + " d-none d-md-inline-block"}>Processo Seletivo</label>
                            </a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/results">
                            <a className={adminStyle.navLink + " nav-link text-primary"}>
                                <i className={adminStyle.icon}>
                                    <FontAwesomeIcon icon={faChartBar} className="sm-icon" />
                                </i>
                                <label className={adminStyle.sidebarLabel + " d-none d-md-inline-block"}>Resultados</label>
                            </a>
                        </Link>

                    </li>
                    {userType === UserType.MASTER && <li>
                        <Link href="/admin/user">
                            <a  className={adminStyle.navLink + " nav-link text-primary"}>
                                <i className={adminStyle.icon}>
                                    <FontAwesomeIcon icon={faUser} className="sm-icon" />
                                </i>
                                <label className={adminStyle.sidebarLabel + " d-none d-md-inline-block"}>Usuários</label>
                            </a>
                        </Link>
                    </li>}
                </ul>
            </div>
        </nav>


    )
}