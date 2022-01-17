import React, { useEffect, useState } from 'react'
import btoa from 'btoa';
import Link from 'next/link';
import { GetServerSidePropsContext } from 'next';
import StudentBase from '../../../components/student/student-base';
import Loading from '../../../components/loading';
import { APIRoutes } from '../../../utils/api.routes';
import API from '../../../lib/api.service';
import Permission from '../../../lib/permission.service';
import { APIResponse } from '../../../models/api-response';
import { UserType } from '../../../enum/type-user.enum';
import { ResourceStepsHelper } from '../../../helpers/resource-steps-helper';
import ResourceUtil from '../../../utils/resource.util';
import { Subscription } from '../../../models/subscription/subscription';
import { SelectiveProcess } from '../../../models/subscription-process/selective-process';

export default function ResourceLayout() {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription>();
  const [canAddResource, setCanAddResource] = useState<boolean>(false);
  const resourceSteps = ResourceStepsHelper.steps();
  const resourceUtil = ResourceUtil();
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
       
        if(resourceUtil.canRequestResource(subscription, selectiveProcess)) {
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
                      <td>{(new Date(resource.date)).toLocaleString()}</td>
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

