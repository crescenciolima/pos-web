import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import { GetServerSidePropsContext } from 'next';
import StudentBase from '../../../components/student/student-base';
import Loading from '../../../components/loading';
import { APIRoutes } from '../../../utils/api.routes';
import API from '../../../lib/api.service';
import Permission from '../../../lib/permission.service';
import { APIResponse } from '../../../models/api-response';
import { Subscription, SubscriptionResource } from '../../../models/subscription';
import { UserType } from '../../../enum/type-user.enum';
import { ProcessStep, SelectiveProcess } from '../../../models/selective-process';
import { ResourceStepsHelper } from '../../../helpers/resource-steps-helper';

export default function ResourceLayout() {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription>();
  const [canAddResource, setCanAddResource] = useState<boolean>(true);
  const resourceSteps = ResourceStepsHelper.steps();
  const api = API(setLoading);

  useEffect(() => {   
    const loadData = async () => {
        const resultSubscription: APIResponse = await api.get(APIRoutes.CURRENT_SUBSCRIPTION);

        if (!resultSubscription.result) {
          return;
        }

        const subscription: Subscription = resultSubscription.result;
        const resultSelectiveProcess: APIResponse = await api.get(APIRoutes.SELECTIVE_PROCESS, { 'id': subscription.selectiveProcessID });
        const selectiveProcess: SelectiveProcess = resultSelectiveProcess.result;
       
        let currentStep: ProcessStep = selectiveProcess.steps.find((step) => selectiveProcess.currentStep === step.order);
        
        let resourceFound: SubscriptionResource = subscription.resources.find((resource) => currentStep.type === resource.step);
        console.log(resourceFound);
        
        if(resourceSteps.includes(currentStep.type) && !resourceFound) {
          setCanAddResource(true);
        }

        setCurrentSubscription(resultSubscription.result);
        setLoading(false);
    };    

    loadData();
  }, []);

  return (
    <StudentBase>
      <div className="row">
        <div className="col-6">
          <h3 className="text-primary-dark">Recursos</h3>
        </div>
        <div className="col-6 text-right">
          {canAddResource && <Link href={{
                  pathname: "/student/resource/new",
                  query: { subscriptionID: currentSubscription?.id },
                }}
          >
            <a className="btn btn-primary">Cadastrar</a>
          </Link>}
        </div>
      </div>
      <div className="row mt-5">
        <div className="col-12 table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Etapa</th>
                <th>Data</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentSubscription?.resources && currentSubscription?.resources.map((resource, i) => {
                return (
                  <Link href={{
                    pathname: "/student/resource/edit",
                    query: { subscriptionID: currentSubscription?.id, step: btoa(resource.step) },
                  }} key={i}>
                    <tr>
                      <td>{resource.step}</td>
                      <td>{(new Date(resource.date)).toISOString()}</td>
                      <td>{resource.status}</td>
                    </tr>
                  </Link>
                )
              })}

            </tbody>
          </table>
          {(!currentSubscription?.resources || currentSubscription.resources?.length == 0) && !isLoading &&
            <div className="alert alert-info mt-3 text-center">
              Nenhum resultado encontrado.
            </div>
          }

        </div>
      </div>
      {isLoading &&
        <Loading />
      }
    </StudentBase>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const permission = Permission();
  return await permission.checkPermission(ctx, [UserType.STUDENT]);
};

