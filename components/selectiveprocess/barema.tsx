import { ErrorMessage, Field, FieldArray, Formik } from 'formik'
import React, { useEffect, useState } from "react";
import teacher from "../../pages/api/teacher";
import * as Yup from 'yup'
import { useRouter } from 'next/router';
import API from '../../lib/api.service';
import { APIRoutes } from '../../utils/api.routes';
import { APIResponse } from '../../models/api-response';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import style from '../../styles/selectiveprocess.module.css'
// import { toast } from 'react-nextjs-toast'
import { v4 as uuidv4 } from 'uuid';
import { SelectiveProcess } from '../../models/subscription-process/selective-process';
import { BaremaCategory } from '../../models/subscription-process/barema-category';

interface Props {
    process: SelectiveProcess;
    saveCallback: Function;
}

export default function SelectiveProcessBarema(props: Props) {

    const router = useRouter();
    const api = API();
    const [baremaCategories, setBaremaCategories] = useState<BaremaCategory[]>([]);


    useEffect(() => {

        setBaremaCategories(props.process.baremaCategories ? props.process.baremaCategories : []);


    }, []);

    const onSubmit = async (values, actions) => {
        let totalPoints = 0;
        //Validating
        for (let category of baremaCategories) {
            if (!category.name) {
                // toast.notify("Preencha o nome de todas as categorias", {
                //     duration: 2,
                //     type: "warning",
                //     title: "Atenção"
                // });
                // return;
            }
            totalPoints += category.maxPoints;

            if (category.subcategories.length == 0) {
                // toast.notify("Todas as categorias tem que ter no mínimo um item", {
                //     duration: 2,
                //     type: "warning",
                //     title: "Atenção"
                // });
                // return;
            }

            for (let subCategory of category.subcategories) {
                if (!subCategory.name) {
                    // toast.notify("Preencha o nome de todos os itens", {
                    //     duration: 2,
                    //     type: "warning",
                    //     title: "Atenção"
                    // });
                    // return;
                }
            }
        }

        try {
            actions.setSubmitting(true);

            let body = props.process;
            body.baremaCategories = baremaCategories;

            const result: APIResponse = await api.post(APIRoutes.SELECTIVE_PROCESS, body);

            props.saveCallback(result.result);

        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }


    //Categories

    const handleCategoryNameChange = (index, evt) => {
        const categories = baremaCategories.map((category, i) => {
            if (index !== i) return category;
            return { ...category, name: evt.target.value };
        });

        setBaremaCategories(categories);
    };

    const handleCategoryMaxPointsChange = (index, evt) => {
        const categories = baremaCategories.map((category, i) => {
            if (index !== i) return category;
            return { ...category, maxPoints: evt.target.value };
        });

        setBaremaCategories(categories);
    };

    const handleAddNewCategory = () => {
        const categories = baremaCategories.concat([{ name: "", maxPoints: 0, subcategories: [{ name: "", points: 1, uuid: uuidv4() }] }]);
        // setValues({ baremaCategories: categories })
        setBaremaCategories(categories);
        // push({ name: "", maxPoints: 0, subcategories: [{ name: "", points: 1 }] });
    };

    const handleRemoveCategory = idx => () => {
        const categories = baremaCategories.filter((category, i) => idx !== i);
        setBaremaCategories(categories);
    };



    //Sub Categories

    const handleSubCategoryNameChange = (categoryIndex, subIndex, evt) => {
        const categories = baremaCategories.map((category, i) => {
            if (categoryIndex !== i) return category;
            return {
                ...category, subcategories: category.subcategories.map((subCategory, subIdx) => {
                    if (subIndex !== subIdx) return subCategory;
                    return { ...subCategory, name: evt.target.value }
                })
            };
        });

        setBaremaCategories(categories);
    };

    const handleSubCategoryPointsChange = (categoryIndex, subIndex, evt) => {
        const categories = baremaCategories.map((category, i) => {
            if (categoryIndex !== i) return category;
            return {
                ...category, subcategories: category.subcategories.map((subCategory, subIdx) => {
                    if (subIndex !== subIdx) return subCategory;
                    return { ...subCategory, points: evt.target.value }
                })
            };
        });

        setBaremaCategories(categories);
    };

    const handleAddNewSubCategory = idx => () => {
        const categories = baremaCategories.map((category, i) => {
            if (idx !== i) return category;
            return { ...category, subcategories: category.subcategories.concat([{ name: "", points: 1, uuid: uuidv4() }]) };
        });

        setBaremaCategories(categories);
    };

    const handleRemoveSubCategory = (categoryIndex, subIndex) => {

        const categories = baremaCategories.map((category, i) => {
            if (categoryIndex !== i) return category;
            return { ...category, subcategories: category.subcategories.filter((subCategory, subIdx) => subIndex !== subIdx) };
        });

        setBaremaCategories(categories);
    };


    const validationSchema = Yup.object().shape({
        baremaCategories: Yup.array().of(
            Yup.object().shape({
                name: Yup.string().required('Preencha este campo.'),
                maxPoints: Yup.string().required('Preencha este campo.'),
                subcategories: Yup.array().of(
                    Yup.object().shape({
                        name: Yup.string().required('Preencha este campo.'),
                        points: Yup.string().required('Preencha este campo.'),
                    })
                )
            })
        )
    });

    return (
        <Formik
            enableReinitialize
            initialValues={{ 'baremaCategories': baremaCategories }}
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

                    <div>
                        <div className="mb-3 ">
                            <label className="form-label mb-3">Categorias do Barema</label>

                            {values.baremaCategories.map((categorie, i) => {

                                return (
                                    <div key={i} className={style.baremaCard}>
                                        <div className="row">
                                            <div className="col-6">
                                                <label className="form-label">Nome da categoria</label>
                                                <input type="text" className={"form-control form-control-sm "}
                                                    name={`baremaCategories.${i}.name`}
                                                    id={'name' + i}
                                                    placeholder="Nome da categoria"
                                                    value={categorie.name}
                                                    onChange={(e) => { handleCategoryNameChange(i, e) }} />
                                            </div>
                                            <div className="col-4">
                                                <label className="form-label">Qtd máxima de pontos</label>
                                                <input type="number" className={"form-control form-control-sm "}
                                                    name={`baremaCategories.${i}.maxPoints`}
                                                    id={i + 'categorieMaxPoints'}
                                                    placeholder="Qtd máxima de pontos"
                                                    value={categorie.maxPoints}
                                                    onChange={(e) => { handleCategoryMaxPointsChange(i, e) }} />
                                            </div>
                                            <div className="col-2 d-flex flex-column">
                                                <button type="button" className="btn text-danger btn-sm mt-auto" onClick={handleRemoveCategory(i)}>
                                                    <FontAwesomeIcon icon={faTrash} className="sm-icon" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="table-responsive mt-4">
                                            <label htmlFor="">Itens da categoria</label>
                                            <table className="table table-striped mb-3 table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Nome</th>
                                                        <th>Pontos</th>
                                                        <th>Excluir</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {categorie.subcategories.map((subcategorie, subIndex) => {
                                                        return (
                                                            <tr key={subIndex}>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        className={"form-control form-control-sm "}
                                                                        name={`baremaCategories.${i}.subcategories.${subIndex}.name`}
                                                                        id={i + 'subName'}
                                                                        placeholder="Nome do item"
                                                                        value={subcategorie.name}
                                                                        onChange={(e) => { handleSubCategoryNameChange(i, subIndex, e) }}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="number"
                                                                        className={"form-control form-control-sm "}
                                                                        name={`baremaCategories.${i}.subcategories.${subIndex}.points`}
                                                                        id={i + 'points'}
                                                                        placeholder="Pontos por item"
                                                                        value={subcategorie.points}
                                                                        onChange={(e) => { handleSubCategoryPointsChange(i, subIndex, e) }}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <button type="button" className="btn btn-sm text-danger" onClick={(e) => { handleRemoveSubCategory(i, subIndex) }}>
                                                                        <FontAwesomeIcon icon={faTrash} className="sm-icon" />
                                                                    </button></td>
                                                            </tr>
                                                        )
                                                    })}

                                                    <tr>
                                                        <td colSpan={3} className="text-center">
                                                            <button type="button" className="btn btn-sm btn-primary" onClick={handleAddNewSubCategory(i)}>
                                                                <FontAwesomeIcon icon={faPlus} className="sm-icon me-2" />
                                                                Adicionar novo item na categoria
                                                            </button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>


                                    </div>

                                )
                            })}
                        </div>
                        <div className="mb-3 text-center">
                            <button type="button" className="btn btn-sm btn-success" onClick={(e) => { handleAddNewCategory() }}>
                                <FontAwesomeIcon icon={faPlus} className="sm-icon me-2" />
                                Adicionar nova categoria
                            </button>
                        </div>
                    </div>



                    {/* <div className="mb-3">
                        {wideCompetitionPlaces > 0 ?
                            <div className="alert alert-primary">Número de vagas de ampla concorrência: <b>{wideCompetitionPlaces}</b></div>
                            :
                            <div className="alert alert-danger">O número de vagas tem que ser maior que o número de vagas reservadas.</div>
                        }
                    </div> */}
                    <div className="text-right">
                        <button type="submit" className="btn btn-primary mt-3 me-auto" disabled={isSubmitting}>Salvar</button>
                    </div>
                </form>
            )}
        </Formik>
    );


}