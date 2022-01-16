import { ErrorMessage, Field, Formik } from 'formik'
import React from "react";
import teacher from "../../pages/api/teacher";
import * as Yup from 'yup'
import { SelectiveProcess } from '../../models/subscription-process/selective-process';
import { useRouter } from 'next/router';
import API from '../../lib/api.service';
import { APIRoutes } from '../../utils/api.routes';
import { APIResponse } from '../../models/api-response';

interface Props {
    process: SelectiveProcess;
    saveCallback: Function;
}

export default function SelectiveProcessBasicInfo(props: Props) {

    const router = useRouter();
    const api = API();


    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true);

            let body = props.process;
            body.title = values.title;
            body.description = values.description;

            const result: APIResponse = await api.post(APIRoutes.SELECTIVE_PROCESS, body);

            props.saveCallback(result.result);

        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }

    return (
        <>
            <Formik
                enableReinitialize
                initialValues={{ ...props.process }}
                validationSchema={
                    Yup.object().shape({
                        title: Yup.string().required('Preencha este campo.'),
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
                            <label htmlFor="name" className="form-label">Título</label>
                            <input
                                type="text"
                                className="form-control"
                                name="title"
                                id="title"
                                placeholder="Título"
                                value={values.title}
                                onChange={handleChange} />
                            <ErrorMessage name="title" className="input-error" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="about" className="form-label">Sobre</label>
                            <textarea
                                className="form-control"
                                name="description"
                                placeholder="Esse texto aparecerá abaixo do título nos PDFs dos resultados gerados"
                                id="description"
                                rows={3}
                                value={values.description}
                                onChange={handleChange}
                            ></textarea>
                            <ErrorMessage name="description" className="input-error" />
                        </div>
                        <div className="text-right">
                            <button type="submit" className="btn btn-primary mt-3 me-auto" disabled={isSubmitting}>Salvar</button>
                        </div>
                    </form>
                )}
            </Formik>
           
        </>
    );
}