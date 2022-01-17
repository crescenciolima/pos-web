import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookReader, faHome, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import adminStyle from '../../styles/admin.module.css';
import React, { useState, useEffect } from 'react';
import { APIResponse } from '../../models/api-response';
import { SelectiveProcess } from '../../models/subscription-process/selective-process';
import { Subscription } from '../../models/subscription/subscription';
import { APIRoutes } from '../../utils/api.routes';
import { css } from "@emotion/core";
import API from '../../lib/api.service';
import { ClipLoader } from 'react-spinners';
import ResourceUtil from '../../utils/resource.util';
import Link from 'next/link'

export default function StudentSidebar({toogleLoading}) {
  const api = API();
  const resourceUtil = ResourceUtil();
  const [loading, setLoading] = useState(true);
  const [selectiveProcess, setSelectiveProcess] = useState<SelectiveProcess>(null);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription>();
  const [allowResource, setAllowResource] = useState<boolean>(false);

    useEffect(() => {   
        const loadData = async () => {
            const resultProcess: APIResponse = await api.get(APIRoutes.SELECTIVE_PROCESS, { 'open': "true" });
            if (resultProcess.result) {
                const selectiveProcess = resultProcess.result;  
                setSelectiveProcess(selectiveProcess);
                setAllowResource(resourceUtil.currentStepIdGranThanFirstResourceStep(selectiveProcess));
            }
    
            const resultSubscription: APIResponse = await api.get(APIRoutes.CURRENT_SUBSCRIPTION);
            if (resultSubscription?.result) {
                setCurrentSubscription(resultSubscription.result);
            }
            
            setLoading(false);
            toogleLoading();
        };      
        loadData();
    }, []);

    const override = css`  
        display: block;
        margin: 0 auto;
    `;

    return (
        <nav className="d-md-block sidebar">
            <div className="d-flex flex-column p-1 p-md-3 text-primary">
            <a className="navbar-brand text-center d-none d-md-inline-block" href="/">
                    <Image src="/images/ifbavca.png" className=" align-text-top" alt="Logo" width={140} height={40} priority={true} />
                </a>
                <a className="navbar-brand text-center mx-0 d-inline-block d-md-none" href="/">
                    <Image src="/images/logo-mobile.png" className=" align-text-top" alt="Logo" width={50} height={55} priority={true} />
                </a>                
                {loading && 
                    <div>
                        <ClipLoader color="#34A853" loading={loading} size={50} css={override}/>
                    </div>
                }
                {!loading && <ul className="nav nav-pills flex-column mb-auto text-primary mt-2 mt-md-5 ">
                    <li key={1}>
                        <Link href="/student">
                            <a className={adminStyle.navLink + " nav-link text-primary sidebar-item"}>
                                <i className={adminStyle.icon}>
                                    <FontAwesomeIcon icon={faHome} className="sm-icon" />
                                </i>
                                <label className={adminStyle.sidebarLabel + " d-none d-md-inline-block"}>Início</label>
                            </a>
                        </Link>
                    </li>
                    {selectiveProcess && <li key={2}>
                        <a href="/student/subscription" className={adminStyle.navLink + " nav-link text-primary"}>
                            <i className={adminStyle.icon}>
                                <FontAwesomeIcon icon={faBookReader} className="sm-icon" />
                            </i>
                            <label className={adminStyle.sidebarLabel + " d-none d-md-inline-block"}>Inscrição</label>
                        </a>
                    </li>}
                    {currentSubscription && allowResource && <li key={3}>
                        <a href="/student/resource" className={adminStyle.navLink + " nav-link text-primary"}>
                            <i className={adminStyle.icon}>
                                <FontAwesomeIcon icon={faQuestionCircle} className="sm-icon" />
                            </i>
                            <label className={adminStyle.sidebarLabel + " d-none d-md-inline-block"}>Recurso</label>
                        </a>
                    </li>}
                </ul>}
            </div>
        </nav>
    )
}