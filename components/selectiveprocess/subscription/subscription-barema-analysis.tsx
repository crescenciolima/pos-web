import { ErrorMessage, Field, Formik } from 'formik'
import React, { useEffect, useState } from "react";
import * as Yup from 'yup'
import { useRouter } from 'next/router';
import { APIRoutes } from '../../../utils/api.routes';
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import { ProcessStep, ProcessStepsState, ProcessStepsTypes, SelectiveProcess } from '../../../models/selective-process';
import { Subscription, SubscriptionFile, SubscriptionStatus } from '../../../models/subscription';
import { faTrash, faClock, faCheck, faTimes, faFile, faIgloo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { format } from 'date-fns';
import BaremaModal from '../dashboard/barema-modal';

interface Props {
    subscription: Subscription;
    process: SelectiveProcess;
}

interface AnalysisCategory {
    name: string;
    categories: AnalysisSubCategory[];
}
interface AnalysisSubCategory {
    name: string;
    files: SubscriptionFile[];
}

export default function SelectiveBaremaAnalysis(props: Props) {

    const router = useRouter();
    const [subscription, setSubscription] = useState<Subscription>();
    const [baremaList, setBaremaList] = useState<AnalysisCategory[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [selectedFile, setSelectedFile] = useState<SubscriptionFile>();
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const api = API(setLoading);


    useEffect(() => {
        console.log(props.process)
        const process = props.process;
        const sub = props.subscription;
        let analysisCategoryList: AnalysisCategory[] = [];

        setSubscription(sub);

        //Correcting undefined observations
        if (sub.files) {
            for (let cat of sub.files) {
                for (let file of cat.files) {
                    file.observation = file.observation || "";
                }
            }

        }

        for (let baremaCat of process.baremaCategories) {
            let analysisCat: AnalysisCategory = {
                name: baremaCat.name,
                categories: []
            }
            for (let subCategories of baremaCat.subcategories) {
                let analysisSubCat: AnalysisSubCategory = {
                    name: subCategories.name,
                    files: []
                }

                if (sub.files) {
                    let filesFromCat = sub.files.filter(file => file.subcategoryID == subCategories.uuid);
                    if (filesFromCat.length > 0) {
                        for (let file of filesFromCat) {
                            analysisSubCat.files = analysisSubCat.files.concat(file.files);
                        }
                        analysisCat.categories.push(analysisSubCat);
                    }

                }
            }
            if (analysisCat.categories.length > 0) {
                analysisCategoryList.push(analysisCat);
            }
        }


        setBaremaList(analysisCategoryList);

    }, []);

    const handleStatusChange = (fileIndex, subCatIndex, catIndex, evt) => {
        const newBaremaList = baremaList.map((cat, i) => {
            if (catIndex !== i) return cat;
            let subCategory = cat.categories[subCatIndex];
            let file = subCategory.files[fileIndex];
            file.status = evt.target.value;
            return cat;
        });

        setBaremaList(newBaremaList);
    }

    const handleObservationChange = (fileIndex, subCatIndex, catIndex, evt) => {
        const newBaremaList = baremaList.map((cat, i) => {
            if (catIndex !== i) return cat;
            let subCategory = cat.categories[subCatIndex];
            let file = subCategory.files[fileIndex];
            file.observation = evt.target.value;
            return cat;
        });

        setBaremaList(newBaremaList);
    }

    const saveBaremaChanges = async () => {
        const response: APIResponse = await api.post(APIRoutes.SELECTIVE_PROCESS_SUBSCRIPTION, subscription);
        const sub: Subscription = response.result;
        setSubscription(sub);
    }

    const onCloseModal = async () => {
        setModalOpen(false);
    }

    const onFileClick = (file: SubscriptionFile) => {
        setSelectedFile(file);
    }

    useEffect(() => {
        if (selectedFile)
            setModalOpen(true);
    }, [selectedFile]);


    return (
        <>

            <div className="row mt-5">
                <div className="col-6">
                    <h5 className="text-primary-dark">Arquivos enviados</h5>
                </div>
            </div>
            {baremaList.map((category, catIndex) => {
                return (
                    <div className="row" key={catIndex}>
                        <div className="col-12">
                            <fieldset>
                                <legend>{category.name}</legend>
                                {category.categories.map((subCategory, subIndex) => {
                                    return (
                                        <div className="row" key={subIndex}>
                                            <div className="col-12">
                                                <fieldset>
                                                    <legend>{subCategory.name}</legend>

                                                    <div className="row mt-4">
                                                        <div className="col-12 table-responsive">
                                                            <table className="table table-striped ">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Arquivo</th>
                                                                        <th>Parecer</th>
                                                                        <th>Motivo</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {subCategory.files.map((file, fileIndex) => {
                                                                        return (
                                                                            <tr key={fileIndex} onClick={(e) => onFileClick(file)}>
                                                                                <td>
                                                                                    <a target="blank" href={file.url} className="link-primary">
                                                                                        <b><FontAwesomeIcon icon={faFile} className="sm-icon mx-1" />Link do Arquivo</b>
                                                                                    </a>
                                                                                </td>
                                                                                <td>
                                                                                    <select
                                                                                        className="form-select form-select-sm"
                                                                                        name="type"
                                                                                        value={file.status}
                                                                                        onChange={(e) => { handleStatusChange(fileIndex, subIndex, catIndex, e) }} >
                                                                                        <option>{SubscriptionStatus.DEFERIDA}</option>
                                                                                        <option>{SubscriptionStatus.INDEFERIDA}</option>
                                                                                        <option>{SubscriptionStatus.AGUARDANDO_ANALISE}</option>

                                                                                    </select>
                                                                                </td>
                                                                                <td>
                                                                                    <input type="text" id={"obs" + catIndex + "" + fileIndex} className="form-control form-control-sm"
                                                                                        value={file.observation} onChange={(e) => { handleObservationChange(fileIndex, subIndex, catIndex, e) }}></input>
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </fieldset>
                                            </div>
                                        </div>
                                    )
                                })}
                            </fieldset>
                        </div>
                    </div>
                )
            })}

            <div className="row mt-4">
                <div className="col-12 text-center">
                    <button className="btn btn-primary" onClick={(e) => { saveBaremaChanges() }}>Salvar Avaliação do Barema</button>

                </div>
            </div>

            <BaremaModal open={modalOpen} file={selectedFile} onClose={onCloseModal} ></BaremaModal>
        </>
    );
}