import { GetServerSidePropsContext,  InferGetServerSidePropsType } from 'next'
import React, { useEffect, useState } from 'react'
import { UserType } from "../../enum/type-user.enum";
import Permission from "../../lib/permission.service";
import StudentBase from "../../components/student/student-base";
import { APIRoutes } from '../../utils/api.routes';
import API from '../../lib/api.service';
import { APIResponse } from '../../models/api-response';
import { SelectiveProcess } from '../../models/subscription-process/selective-process';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import style from '../../styles/subscription.module.css';


export default function Admin(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

  const api = API();
  const [selectiveProcess, setSelectiveProcess] = useState<SelectiveProcess>(null); 


  useEffect(() => {
    api.get(APIRoutes.SELECTIVE_PROCESS, { 'open': "true" }).then(
      async (response: APIResponse) => {
        if(response.result){
          let selProc : SelectiveProcess = await response.result;
          setSelectiveProcess(selProc)
        }
      }
    )
  },[])

  if (selectiveProcess === null){
    return (<StudentBase></StudentBase>)
  }
    
  return (
    <StudentBase>
      <div>
        <fieldset>
          <div>
            <h4>Processo Seletivo: {selectiveProcess.title}</h4>

            <p className="mt-4">Etapa atual: <b>{selectiveProcess.steps[selectiveProcess.currentStep].type}</b></p>

            <p>Status do processo seletivo: {selectiveProcess.state === "open" ? "Aberto" : "Fechado"}</p>

          </div>
        </fieldset>
        
        <div className="col-12">
          <fieldset>
              <legend>Editais</legend>
              <div className="mb-3">
                {selectiveProcess.processNotices?.map((notice) => (
                  <>
                    <div>
                      <a href={notice.url} className={style.titleFileForm} target="_blank">
                        <FontAwesomeIcon icon={faFile} className={style.iconFileForm}/>{notice.name}
                      </a>
                    </div>
                  </>
                ))}                
              </div>
          </fieldset>
        </div>
        <div>
          <fieldset>
            <legend>Etapas do Processo Seletivo</legend>
            <div className="table-responsive col-12">
              <table id="selective-process">
                <thead>
                  <tr>
                    <td>Etapa</td>
                    <td>Data de Início</td>
                    <td>Data de Finalização</td>
                    <td>Resultado</td>
                  </tr>
                </thead>
                <tbody>
                  {selectiveProcess.steps.map((step,key)=>(
                    <tr key={key} className={selectiveProcess.currentStep === key?"current-sel-proc":""} 
                    title={selectiveProcess.currentStep === key?"Etapa atual":""}>
                      <td>{step.type}</td>
                      <td>{new Date(step.startDate).toLocaleDateString()}</td>
                      <td>{new Date(step.finishDate).toLocaleDateString()}</td>
                      <td>
                          {step.resultURL ? <a href={step.resultURL} className={style.titleFileForm} target="_blank">
                            <FontAwesomeIcon icon={faFile} className={style.iconFileForm}/>Download
                          </a> : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>          
          </fieldset>
        </div>
      </div>
    </StudentBase>
  )
}


export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const permission = Permission();
  return await permission.checkPermission(ctx, [UserType.STUDENT]);
};
