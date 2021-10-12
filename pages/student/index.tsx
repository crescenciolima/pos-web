import { GetServerSidePropsContext,  InferGetServerSidePropsType } from 'next'
import React, { useEffect, useState } from 'react'
import { UserType } from "../../enum/type-user.enum";
import Permission from "../../lib/permission.service";
import StudentBase from "../../components/student/student-base";
import { subSeconds } from 'date-fns/esm';
import { useRouter } from 'next/router';
import { APIRoutes } from '../../utils/api.routes';
import API from '../../lib/api.service';
import { route } from 'next/dist/next-server/server/router';
import { Subscription, SubscriptionStatus } from '../../models/subscription';
import { APIResponse } from '../../models/api-response';
import { SelectiveProcess } from '../../models/selective-process';
import { sub } from 'date-fns';
import { setgroups } from 'process';


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

  //return a null component before StudentBase si rendered
  if (selectiveProcess === null){
    return (<StudentBase></StudentBase>)
  }
    
  return (
    <StudentBase>
      <div>
        <fieldset>
          <div>
            <h4>Processo Seletivo: {selectiveProcess.title}</h4>

            <p>{selectiveProcess.description}</p>

            <p>Estado do processo seletivo: {selectiveProcess.state=="open"? "Aberto" : "Fechado"}</p>

            <p>Iniciado em: {new Date(selectiveProcess.currentStep).toLocaleDateString()}</p>

          </div>
        </fieldset>
        <div>
          <fieldset>
          <label className="form-label">Etapas do Processo Seletivo</label>
          <table id="selective-process">
            <thead>
              <tr>
                <td>Etapa</td>
                <td>Data de Início</td>
                <td>Data de Finalização</td>
              </tr>
            </thead>
            <tbody>
              {selectiveProcess.steps.map((step,key)=>(
                <tr key={key} className={selectiveProcess.currentStep === key?"current-sel-proc":""} 
                title={selectiveProcess.currentStep === key?"Etapa Atual":""}>
                  <td>{step.type}</td>
                  <td>{new Date(step.startDate).toLocaleDateString()}</td>
                  <td>{new Date(step.finishDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
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
