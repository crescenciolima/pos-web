import { ErrorMessage, FieldArray, Formik } from 'formik'
import React, { useEffect, useState } from "react";
import * as Yup from 'yup'
import adminStyle from '../../styles/admin.module.css';
import { useRouter } from 'next/router';
import API from '../../lib/api.service';
import { APIRoutes } from '../../utils/api.routes';
import { APIResponse } from '../../models/api-response';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";

import ptBR from 'date-fns/locale/pt-BR';
registerLocale('pt-BR', ptBR)



import "react-datepicker/dist/react-datepicker.css";
import { SelectiveProcess } from '../../models/subscription-process/selective-process';
import { ProcessStep } from '../../models/subscription-process/process-step';
import { ProcessStepsTypes } from '../../models/subscription-process/process-steps-types.enum';

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
            step['selectedFinishDate'] = new Date(step.finishDate);
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
            let index = 0;
            for (let step of steps) {

                step.order = index;
                index++;
            }

            actions.setSubmitting(true);

            let body = props.process;
            body.steps = steps;

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
                weight: Yup.number().max(100, "Entre 0 e 100").required('Preencha este campo.'),
                passingScore: Yup.number().max(100, "Entre 0 e 100").required('Preencha este campo.'),
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
                                                <th className={adminStyle.etapaCol}>Etapa </th>
                                                <th>Data Início</th>
                                                <th>Data Fim</th>
                                                <th  className={adminStyle.inputCol}>Nota Corte (0-100)</th>
                                                <th  className={adminStyle.inputCol}>Peso</th>
                                                <th>Opções</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {values.steps.map((step, index) => (
                                                <tr key={index}>
                                                    <td  className={adminStyle.etapaCol}>
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
                                                        <input type="number" className={"form-control form-control-sm "}
                                                            name={`steps.${index}.passingScore`}
                                                            id={'passingScore' + index}
                                                            placeholder="De 0 a 100"
                                                            readOnly={!( step.type == ProcessStepsTypes.ENTREVISTA || step.type == ProcessStepsTypes.PROVA)}
                                                            value={step.passingScore}
                                                            maxLength={3}
                                                            onChange={handleChange} />
                                                        <ErrorMessage name={`steps.${index}.passingScore`} className="input-error" />

                                                    </td>
                                                    <td>
                                                        <input type="number" className={"form-control form-control-sm "}
                                                            name={`steps.${index}.weight`}
                                                            id={'weight' + index}
                                                            placeholder="Peso"
                                                            value={step.weight}
                                                            readOnly={!(step.type == ProcessStepsTypes.AVALIACAO_CURRICULAR || step.type == ProcessStepsTypes.ENTREVISTA || step.type == ProcessStepsTypes.PROVA)}
                                                            maxLength={3}
                                                            onChange={handleChange} />
                                                        <ErrorMessage name={`steps.${index}.weight`} className="input-error" />

                                                    </td>
                                                    <td>
                                                        {index > 0 ? <button type="button" className="btn btn-sm btn-link me-1" onClick={(e) => arrayHelpers.swap(index, index - 1)} >
                                                            <FontAwesomeIcon icon={faArrowUp} className="sm-icon" />
                                                        </button> : null}
                                                        {index < (values.steps.length - 1) ? <button type="button" className="btn btn-sm btn-link me-1" onClick={(e) => arrayHelpers.swap(index, index + 1)} >
                                                            <FontAwesomeIcon icon={faArrowDown} className="sm-icon" />
                                                        </button> : null}
                                                        <button type="button" className="btn btn-sm btn-link text-danger" onClick={(e) => arrayHelpers.remove(index)} >
                                                            <FontAwesomeIcon icon={faTrash} className="sm-icon" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td colSpan={6} className="text-center">
                                                    <button
                                                        type="button" className="btn btn-primary" onClick={() => arrayHelpers.push({ type: ProcessStepsTypes.INSCRICAO, selectedStartDate: new Date(), selectedFinishDate: new Date(), weight: 0, passingScore: 0 })}                                                     >
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


