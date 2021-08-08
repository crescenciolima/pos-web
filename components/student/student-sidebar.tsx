import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faBookReader, faChalkboardTeacher, faFile, faFileAlt, faFileInvoice, faFolder, faCopy, faUser, faHome } from '@fortawesome/free-solid-svg-icons'
import adminStyle from '../../styles/admin.module.css';

export default function StudentSidebar() {
    //const { userType } = props; 
    return (
        <nav className="col-md-3 col-lg-2 d-md-block sidebar">
            <div className="d-flex flex-column p-3 text-primary">
                <a className="navbar-brand text-center" href="/">
                    <Image src="/images/ifbavca.png" className="d-inline-block align-text-top" alt="Logo" width={140} height={40} priority={true} />
                </a>
                <ul className="nav nav-pills flex-column mb-auto text-primary mt-5">
                    <li>
                        <a href="/student" className="nav-link text-primary sidebar-item">
                            <i className={adminStyle.icon}>
                                <FontAwesomeIcon icon={faHome} className="sm-icon" />
                            </i>
                            <label className={adminStyle.sidebarLabel}>Início</label>
                        </a>
                    </li>
                    <li>
                        <a href="/student/subscription" className="nav-link text-primary">
                            <i className={adminStyle.icon}>
                                <FontAwesomeIcon icon={faBookReader} className="sm-icon" />
                            </i>
                            <label className={adminStyle.sidebarLabel}>Inscrição</label>
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    )
}