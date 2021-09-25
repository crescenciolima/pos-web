import React, { useEffect, useState } from 'react'

import { APIRoutes } from '../../../utils/api.routes'
import AdminBase from '../../../components/admin/admin-base'
import { useRouter } from 'next/router'
import Link from 'next/link';
import * as Yup from 'yup'
import { ErrorMessage, Field, Formik } from 'formik'
import { toast } from 'react-nextjs-toast'
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import { GetServerSidePropsContext } from 'next';
import { UserType } from '../../../enum/type-user.enum';
import Permission from '../../../lib/permission.service';
import { SubscriptionResource } from '../../../models/subscription';
import StudentBase from '../../../components/student/student-base';

export default function SaveResourceLayout() {
    const router = useRouter();
    const {
      query: { subscriptionID },
    } = router;
    const api = API();

    const [resource, setResource] = useState<SubscriptionResource>();
    const [files, setFiles] = useState<FileList>();

    const saveResource = async (values) => {
        api.postFile(APIRoutes.RESOURCES, { ...values, subscriptionID }, files);
    };

    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true);
            await saveResource(values);
        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }

    return (
        <StudentBase>
            <div className="row mb-3">
                <div className="col-12 text-right">
                    <Link href="/student/resource">
                        <a className="link-primary ">Voltar</a>
                    </Link>
                </div>
            </div>
            <Formik
                enableReinitialize
                initialValues={{ ...resource, photo: '', file: undefined }}
                validationSchema={
                    Yup.object().shape({
                        justification: Yup.string().required('Preencha este campo.'),
                    })}
                onSubmit={onSubmit}>
                {({
                    values,
                    isSubmitting,
                    handleSubmit,
                    handleChange,
                    setFieldValue
                }) => (
                    <form onSubmit={handleSubmit}>                       
                        <div className="mb-3">
                            <label htmlFor="justification" className="form-label">Justificativa</label>
                            <textarea
                                className="form-control"
                                name="justification"
                                id="justification"
                                rows={3}
                                value={values.justification}
                                onChange={handleChange}
                            ></textarea>
                            <p className="input-error"><ErrorMessage name="justification" className="input-error" /></p>
                        </div>
                        <div className="text-right">
                        <button type="submit" className="btn btn-primary mt-3 me-auto" disabled={isSubmitting}>Salvar</button>
                        </div>
                    </form>
                )}
            </Formik>
        </StudentBase>
    )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const permission = Permission();
    return await permission.checkPermission(ctx, [UserType.STUDENT]);
  };

