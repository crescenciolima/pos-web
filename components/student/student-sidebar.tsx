import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faBookReader, faChalkboardTeacher, faFile, faFileAlt, faFileInvoice, faFolder, faCopy, faUser, faHome, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import adminStyle from '../../styles/admin.module.css';
import React, { useState, useEffect } from 'react';
import { APIResponse } from '../../models/api-response';
import { SelectiveProcess } from '../../models/selective-process';
import { Subscription } from '../../models/subscription';
import { APIRoutes } from '../../utils/api.routes';
import { css } from "@emotion/core";
import API from '../../lib/api.service';
import { ClipLoader } from 'react-spinners';
import ResourceUtil from '../../lib/resource.util';
import SelectiveProcessUtil from '../../lib/selectiveprocess.util';

export default function StudentSidebar() {
    //const { userType } = props; 
  const api = API();
  const resourceUtil = ResourceUtil();
  const selectiveProcessUtil = SelectiveProcessUtil();
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
                const currentStep = selectiveProcessUtil.getCurrentStep(selectiveProcess);
                setAllowResource(resourceUtil.currentStepIdGranThanFirstResourceStep(selectiveProcess));
            }
    
            const resultSubscription: APIResponse = await api.get(APIRoutes.CURRENT_SUBSCRIPTION);
            if (resultSubscription?.result) {
                setCurrentSubscription(resultSubscription.result);
            }
            
            setLoading(false);
        };      
        loadData();
    }, []);

    const override = css`  
        display: block;
        margin: 0 auto;
    `;

    return (
        <nav className="col-md-3 col-lg-2 d-md-block sidebar">
            <div className="d-flex flex-column p-3 text-primary">
                <a className="navbar-brand text-center" href="/">
                    <Image src="/images/ifbavca.png" className="d-inline-block align-text-top" alt="Logo" width={140} height={40} priority={true} />
                </a>
                {loading && 
                    <div>
                        <ClipLoader color="#34A853" loading={loading} size={50} css={override}/>
                    </div>
                }
                {!loading && <ul className="nav nav-pills flex-column mb-auto text-primary mt-5">
                    <li>
                        <a href="/student" className="nav-link text-primary sidebar-item">
                            <i className={adminStyle.icon}>
                                <FontAwesomeIcon icon={faHome} className="sm-icon" />
                            </i>
                            <label className={adminStyle.sidebarLabel}>Início</label>
                        </a>
                    </li>
                    {selectiveProcess && <li>
                        <a href="/student/subscription" className="nav-link text-primary">
                            <i className={adminStyle.icon}>
                                <FontAwesomeIcon icon={faBookReader} className="sm-icon" />
                            </i>
                            <label className={adminStyle.sidebarLabel}>Inscrição</label>
                        </a>
                    </li>}
                    {currentSubscription && allowResource && <li>
                        <a href="/student/resource" className="nav-link text-primary">
                            <i className={adminStyle.icon}>
                                <FontAwesomeIcon icon={faQuestionCircle} className="sm-icon" />
                            </i>
                            <label className={adminStyle.sidebarLabel}>Recurso</label>
                        </a>
                    </li>}
                </ul>}
            </div>
        </nav>
    )
}