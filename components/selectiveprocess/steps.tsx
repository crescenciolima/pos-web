import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik'
import React, { useEffect, useState } from "react";
import teacher from "../../pages/api/teacher";
import * as Yup from 'yup'
import { BaremaCategory, ProcessStep, ProcessStepsTypes, ReservedPlace, SelectiveProcess } from '../../models/selective-process';
import { useRouter } from 'next/router';
import API from '../../lib/api.service';
import { APIRoutes } from '../../lib/api.routes';
import { APIResponse } from '../../models/api-response';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import style from '../../styles/selectiveprocess.module.css'
// import { toast } from 'react-nextjs-toast'
// import DayPickerInput from 'react-day-picker/DayPickerInput';
// import 'react-day-picker/lib/style.css';
import DatePicker from "react-datepicker";
import { registerLocale, setDefaultLocale } from "react-datepicker";

import ptBR from 'date-fns/locale/pt-BR';
registerLocale('pt-BR', ptBR)



import "react-datepicker/dist/react-datepicker.css";
import fire from '../../utils/firebase-util';

interface Props {
    process: SelectiveProcess;
    saveCallback: Function;
}

export default function SelectiveProcessSteps(props: Props) {

    const router = useRouter();
    const api = API();
    const [steps, setSteps] = useState<ProcessStep[]>([]);
    const [types, setTypes] = useState<string[]>([]);

    useEffect(() => {

        let steps: ProcessStep[] = props.process.steps ? props.process.steps : [];
        for (let step of steps) {

            step['selectedStartDate'] = new Date(step.startDate);
            step['selectedFinishDate'] =  new Date(step.finishDate);
        }

        setSteps(steps);


        const typesList = []
        for (const [propertyKey, propertyValue] of Object.entries(ProcessStepsTypes)) {
            if (!Number.isNaN(Number(propertyKey))) {
                continue;
            }
            typesList.push(propertyValue);
        }
        setTypes(typesList);
    }, []);



    const onSubmit = async (values, actions) => {

        try {

            let steps: ProcessStep[] = values.steps;
            for (let step of steps) {
                step.startDate = fire.firestore.Timestamp.fromDate(step['selectedStartDate']).toMillis();
                step.finishDate = fire.firestore.Timestamp.fromDate(step['selectedFinishDate']).toMillis();
                step.weight = 0;
                step.order = steps.indexOf(step);
                step.passingScore = 0;
                console.log(step);
            }

            actions.setSubmitting(true);

            const body = {
                id: props.process.id,
                steps: steps,
            }

            const result: APIResponse = await api.post(APIRoutes.SELECTIVE_PROCESS, body);

            props.saveCallback(result.result);

        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }




    const validationSchema = Yup.object().shape({
        steps: Yup.array().of(
            Yup.object().shape({
                // name: Yup.string().required('Preencha este campo.'),
                // startDate: Yup.string().required('Preencha este campo.'),
                // finishDate: Yup.string().required('Preencha este campo.'),
                // weight: Yup.string().required('Preencha este campo.'),
                // passingScore: Yup.string().required('Preencha este campo.'),
                selectedStartDate: Yup.date().required('Preencha este campo.').nullable(),
                selectedFinishDate: Yup.date().required('Preencha este campo.').nullable(),
                type: Yup.string().required('Preencha este campo.'),
            })
        )
    });

    return (
        <Formik
            enableReinitialize
            initialValues={{ 'steps': steps }}
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

                    <FieldArray
                        name="steps"
                        render={arrayHelpers => (
                            <div className="row">
                                <div className="col-12 table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Etapa </th>
                                                <th>Data Início</th>
                                                <th>Data Fim</th>
                                                <th>Opções</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {values.steps.map((step, index) => (
                                                <tr key={index}>
                                                    {/* <Field name={`steps.${index}`} /> */}
                                                    {/* <td>
                                                        <input type="text" className={"form-control form-control-sm "}
                                                            name={`steps.${index}.name`}
                                                            id={'name' + index}
                                                            placeholder="Nome da etapa"
                                                            value={step.name}
                                                            onChange={handleChange} />
                                                        <ErrorMessage name={`steps.${index}.name`} className="input-error" />

                                                    </td> */}
                                                    <td>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            name={`steps.${index}.type`}
                                                            id={`steps.${index}.type`}
                                                            value={step.type}
                                                            onChange={handleChange}  >
                                                            {types.map((type, i) => (
                                                                <option key={i}>{type}</option>
                                                            ))}
                                                        </select>
                                                        <ErrorMessage name={`steps.${index}.type`} className="input-error" />
                                                    </td>
                                                    <td>
                                                        <DatePicker locale="pt-BR" selected={step.selectedStartDate} dateFormat="dd/MM/yyyy" onChange={(date) => { setFieldValue(`steps.${index}.selectedStartDate`, date); }} />
                                                        <ErrorMessage name={`steps.${index}.selectedStartDate`} className="input-error" />
                                                    </td>
                                                    <td>
                                                        <DatePicker locale="pt-BR" selected={step.selectedFinishDate} dateFormat="dd/MM/yyyy" onChange={(date) => { setFieldValue(`steps.${index}.selectedFinishDate`, date); }} />
                                                        <ErrorMessage name={`steps.${index}.selectedFinishDate`} className="input-error" />
                                                    </td>
                                                    <td>
                                                        {index > 0 ? <button className="btn btn-sm btn-link me-1" onClick={(e) => arrayHelpers.swap(index, index - 1)} >
                                                            <FontAwesomeIcon icon={faArrowUp} className="sm-icon" />
                                                        </button> : null}
                                                        {index < (values.steps.length - 1) ? <button className="btn btn-sm btn-link me-1" onClick={(e) => arrayHelpers.swap(index, index + 1)} >
                                                            <FontAwesomeIcon icon={faArrowDown} className="sm-icon" />
                                                        </button> : null}
                                                        <button className="btn btn-sm btn-link text-danger" onClick={(e) => arrayHelpers.remove(index)} >
                                                            <FontAwesomeIcon icon={faTrash} className="sm-icon" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td colSpan={4} className="text-center">
                                                    <button
                                                        type="button" className="btn btn-primary" onClick={() => arrayHelpers.push({ type: ProcessStepsTypes.INSCRICAO, selectedStartDate: new Date(), selectedFinishDate: new Date() })}                                                     >
                                                        Nova Etapa
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>


                                <div>
                                    <button type="submit" className="btn btn-primary mt-3 me-auto" disabled={isSubmitting}>Salvar</button>
                                </div>
                            </div>
                        )}
                    />
                </form>
            )}
        </Formik >
    );


}


