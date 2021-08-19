import { ErrorMessage, Field, FieldArray, Formik } from 'formik'
import React, { useEffect, useState } from "react";
import teacher from "../../pages/api/teacher";
import * as Yup from 'yup'
import { BaremaCategory, ProcessDocument, ReservedPlace, SelectiveProcess } from '../../models/selective-process';
import { useRouter } from 'next/router';
import API from '../../lib/api.service';
import { APIRoutes } from '../../utils/api.routes';
import { APIResponse } from '../../models/api-response';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import style from '../../styles/selectiveprocess.module.css'
// import { toast } from 'react-nextjs-toast'

interface Props {
    process: SelectiveProcess;
    saveCallback: Function;
}

export default function SelectiveProcessDocuments(props: Props) {

    const router = useRouter();
    const api = API();
    const [processForms, setProcessForms] = useState<ProcessDocument[]>([]);
    const [processNotices, setProcessNotices] = useState<ProcessDocument[]>([]);
    const [document, setDocument] = useState<ProcessDocument>({ name: "", url: "" });
    const [type, setType] = useState<String>("Edital");
    const [file, setFile] = useState<FileList>();



    useEffect(() => {
        setProcessForms(props.process.processForms ? props.process.processForms : []);
        setProcessNotices(props.process.processNotices ? props.process.processNotices : []);

    }, []);

    const onSubmit = async (values, actions) => {
        console.log("aqui", values)
        try {
            actions.setSubmitting(true);

            const body = {
                id: props.process.id,
                name: values.name,
                type: values.type
            }

            const result: APIResponse = await api.postFile(APIRoutes.SELECTIVE_PROCESS_FILES, body, file && file.length > 0 ? file[0] : null);

            props.saveCallback(result.result);


            setProcessForms(result.result.processForms ? result.result.processForms : []);
            setProcessNotices(result.result.processNotices ? result.result.processNotices : []);

        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }

    const handleDeleteNotice = async (doc, index) => {
        let docs = JSON.parse(JSON.stringify(processNotices));
        docs.splice(index, 1);
        const body = {
            id: props.process.id,
            processNotices: docs,
            document: doc
        }
        const result: APIResponse = await api.excludeFormData(APIRoutes.SELECTIVE_PROCESS_FILES, body);

        props.saveCallback(result.result);
        setProcessNotices(result.result.processNotices ? result.result.processNotices : []);

    }

    const handleDeleteForm = async (doc, index) => {
        let docs = JSON.parse(JSON.stringify(processForms));
        docs.splice(index, 1);
        const body = {
            id: props.process.id,
            processForms: docs,
            document: doc
        }
        const result: APIResponse = await api.excludeFormData(APIRoutes.SELECTIVE_PROCESS_FILES, body);

        props.saveCallback(result.result);
        setProcessForms(result.result.processForms ? result.result.processForms : []);

    }

    const validationSchema = Yup.object().shape({
        processDocuments: Yup.array().of(
            Yup.object().shape({
                name: Yup.string().required('Preencha este campo.'),
                url: Yup.string().required('Preencha este campo.'),
                type: Yup.string().required('Preencha este campo.'),
            })
        )
    });

    return (
        <>
            <Formik
                enableReinitialize
                initialValues={{ ...document, type }}
                validationSchema={validationSchema}
                onSubmit={onSubmit}>
                {({
                    errors,
                    values,
                    isSubmitting,
                    handleSubmit,
                    handleChange,
                    setFieldValue,
                    setValues,
                    touched
                }) => (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">Nome do Arquivo</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                id="name"
                                placeholder=""
                                value={values.name}
                                onChange={handleChange} />
                            <ErrorMessage name="name" className="input-error" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">Tipo</label>
                            <select
                                className="form-select"
                                name="type"
                                id="type"
                                value={values.type}
                                onChange={handleChange} >
                                <option>Edital</option>
                                <option>Formulário</option>
                            </select>
                            <ErrorMessage name="type" className="input-error" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="photo" className="form-label">Arquivo</label>
                            <input
                                type="file"
                                className="form-control"
                                name="url"
                                id="url"
                                value={values.url}
                                onChange={(event) => {
                                    handleChange(event);
                                    setFile(event.currentTarget.files);
                                }} />
                            <ErrorMessage name="url" className="input-error" />
                        </div>

                        <div className="text-right">
                            <button type="submit" className="btn btn-primary mt-3 me-auto" disabled={isSubmitting}>Salvar</button>
                        </div>
                    </form>
                )}
            </Formik>

            <div className="row mt-4">
                <div className="col-12 table-responsive">
                    <label>Editais</label>
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Arquivo</th>
                                <th>Excluir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processNotices.map((docs, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{docs.name}</td>
                                        <td></td>
                                        <td><button className="btn btn-sm btn-danger" onClick={(e) => { handleDeleteNotice(docs, i) }} >
                                            <FontAwesomeIcon icon={faTrash} className="sm-icon" />
                                        </button></td>
                                    </tr>
                                )
                            })}

                        </tbody>
                    </table>
                    {(processNotices.length == 0) &&
                        <div className="alert alert-info mt-3 text-center">
                            Nenhum edital encontrado.
                        </div>
                    }

                </div>
            </div>

            <div className="row mt-4">
                <div className="col-12 table-responsive">
                    <label>Formulários</label>
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Arquivo</th>
                                <th>Excluir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processForms.map((docs, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{docs.name}</td>
                                        <td></td>
                                        <td><button className="btn btn-sm btn-danger" onClick={(e) => { handleDeleteForm(docs, i) }} >
                                            <FontAwesomeIcon icon={faTrash} className="sm-icon" />
                                        </button></td>
                                    </tr>
                                )
                            })}

                        </tbody>
                    </table>
                    {(processForms.length == 0) &&
                        <div className="alert alert-info mt-3 text-center">
                            Nenhum formulário encontrado.
                        </div>
                    }

                </div>
            </div>
        </>
    );


}