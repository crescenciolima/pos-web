import { ErrorMessage, Field, Formik } from 'formik'
import React, { useEffect, useState } from "react";
import * as Yup from 'yup'
import { useRouter } from 'next/router';
import API from '../../lib/api.service';
import { APIRoutes } from '../../utils/api.routes';
import { APIResponse } from '../../models/api-response';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import { SelectiveProcess } from '../../models/subscription-process/selective-process';
import { ReservedPlace } from '../../models/subscription-process/reserved-place';

interface Props {
    process: SelectiveProcess;
    saveCallback: Function;
}

export default function SelectiveProcessPlaces(props: Props) {

    const router = useRouter();
    const api = API();
    const [reservedPlaces, setReservedPlaces] = useState<ReservedPlace[]>([]);
    const [wideCompetitionPlaces, setWideCompetitionPlaces] = useState<number>(0);
    const [totalNumberPlaces, setTotalNumberPlaces] = useState<number>(0);

    useEffect(() => {

        setReservedPlaces(props.process.reservedPlaces ? props.process.reservedPlaces : []);
        setTotalNumberPlaces(props.process.numberPlaces)
        calcNumberWideCompetitionPlaces();

    }, []);

    useEffect(() => {
        calcNumberWideCompetitionPlaces();
    }, [totalNumberPlaces, reservedPlaces]);

    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true);

            let body = props.process;
            body.numberPlaces = values.numberPlaces;
            body.reservedPlaces = reservedPlaces;

            const result: APIResponse = await api.post(APIRoutes.SELECTIVE_PROCESS, body);

            props.saveCallback(result.result);

        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }

    const handleReservedPlaceNameChange = (index, evt) => {
        const newReservedPlaces = reservedPlaces.map((reservedPlace, i) => {
            if (index !== i) return reservedPlace;
            return { ...reservedPlace, name: evt.target.value };
        });

        setReservedPlaces(newReservedPlaces);
    };

    const handleReservedPlaceNumberChange = (index, evt) => {
        const newReservedPlaces = reservedPlaces.map((reservedPlace, i) => {
            if (index !== i) return reservedPlace;
            return { ...reservedPlace, numberPlaces: evt.target.value };
        });

        setReservedPlaces(newReservedPlaces);
    };

    const handleAddNewReservedPlace = () => {
        setReservedPlaces(reservedPlaces.concat([{ name: "", numberPlaces: 1 , uuid: uuidv4()}]));
    };

    const handleRemoveReservedPlace = idx => () => {
        const newReservedPlaces = reservedPlaces.filter((reservedPlace, i) => idx !== i);
        setReservedPlaces(newReservedPlaces);
    };

    function calcNumberWideCompetitionPlaces() {
      
        let wideCompPlaces = totalNumberPlaces;

        let numberReservedPlaces: number = 0;
        for (let place of reservedPlaces) {
            wideCompPlaces = wideCompPlaces - place.numberPlaces;
            numberReservedPlaces += place.numberPlaces;
        }
        if (wideCompPlaces <= 0) {
            setWideCompetitionPlaces(0);
        }
        else {
            setWideCompetitionPlaces(wideCompPlaces);
        }

    }

    return (
        <Formik
            enableReinitialize
            initialValues={{ ...props.process }}
            validationSchema={
                Yup.object().shape({
                    numberPlaces: Yup.string().required('Preencha este campo.'),
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
                    <div className="mb-5">
                        <label htmlFor="name" className="form-label">Quantidade de vagas</label>
                        <input
                            type="number"
                            className="form-control"
                            name="numberPlaces"
                            id="numberPlaces"
                            placeholder="N de vagas"
                            value={values.numberPlaces}
                            onChange={(event) => {
                                handleChange(event);
                                setTotalNumberPlaces(+event.target.value);
                            }} />
                        <ErrorMessage name="numberPlaces" className="input-error" />
                    </div>
                    <div className="mb-3 table-responsive">
                        <label className="form-label">Vagas Destinadas</label>
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Quantidade de vagas</th>
                                    <th>Excluir</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservedPlaces.map((place, i) => {
                                    return (
                                        <tr key={i}>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name={i + 'reservedPlaceName'}
                                                    id={i + 'reservedPlaceName'}
                                                    placeholder="Nome da vaga reservada"
                                                    value={place.name}
                                                    onChange={(e) => { handleReservedPlaceNameChange(i, e) }}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name={i + 'numberPlaces'}
                                                    id={i + 'numberPlaces'}
                                                    placeholder="N de vagas reservadas"
                                                    value={place.numberPlaces}
                                                    onChange={(e) => { handleReservedPlaceNumberChange(i, e) }}
                                                />
                                            </td>
                                            <td>
                                                <button type="button" className="btn btn-sm btn-danger" onClick={handleRemoveReservedPlace(i)}>
                                                    <FontAwesomeIcon icon={faTrash} className="sm-icon" />
                                                </button></td>
                                        </tr>
                                    )
                                })}
                                <tr>
                                    <td colSpan={3} className="text-center">
                                        <button type="button" className="btn btn-sm btn-success" onClick={handleAddNewReservedPlace}>
                                            <FontAwesomeIcon icon={faPlus} className="sm-icon me-2" />
                                            Adicionar nova vaga reservada
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mb-3">
                        {wideCompetitionPlaces > 0 ?
                            <div className="alert alert-primary">Número de vagas de ampla concorrência: <b>{wideCompetitionPlaces}</b></div>
                            :
                            <div className="alert alert-danger">O número de vagas tem que ser maior que o número de vagas reservadas.</div>
                        }
                    </div>
                    <div className="text-right">
                        <button type="submit" className="btn btn-primary mt-3 me-auto" disabled={isSubmitting || !wideCompetitionPlaces}>Salvar</button>
                    </div>
                </form>
            )}
        </Formik>
    );


}