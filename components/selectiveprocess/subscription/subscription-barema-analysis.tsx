import { ErrorMessage, Field, Formik } from 'formik'
import React, { useEffect, useState } from "react";
import * as Yup from 'yup'
import { useRouter } from 'next/router';
import { APIRoutes } from '../../../utils/api.routes';
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import { ProcessStep, ProcessStepsState, ProcessStepsTypes, SelectiveProcess } from '../../../models/subscription-process/selective-process';
import { Subscription, SubscriptionFile, SubscriptionStatus } from '../../../models/subscription/subscription';
import { faTrash, faClock, faCheck, faTimes, faFile, faIgloo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { format } from 'date-fns';
import BaremaModal from '../dashboard/barema-modal';

interface Props {
    subscription: Subscription;
    process: SelectiveProcess;
}

export interface AnalysisCategory {
    name: string;
    categories: AnalysisSubCategory[];
}
export interface AnalysisSubCategory {
    name: string;
    files: SubscriptionFile[];
}

export default function SelectiveBaremaAnalysis(props: Props) {

    const router = useRouter();
    const [subscription, setSubscription] = useState<Subscription>();
    const [baremaList, setBaremaList] = useState<AnalysisCategory[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [selectedFile, setSelectedFile] = useState<SubscriptionFile>();
    const [selectedCategory, setSelectedCategory] = useState<number>(0);
    const [selectedSubCategory, setSelectedSubCategory] = useState<number>(0);

    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const api = API(setLoading);


    useEffect(() => {
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

    const saveBaremaChanges = async () => {
        const response: APIResponse = await api.post(APIRoutes.SELECTIVE_PROCESS_SUBSCRIPTION, subscription);
        const sub: Subscription = response.result;
        setSubscription(sub);
    }

    const onCloseModal = async (selectedFile: SubscriptionFile) => {
        const newBaremaList = baremaList.map((cat, i) => {
            if (selectedCategory !== i) return cat;
            let subCategory = cat.categories[selectedSubCategory];
            let file = subCategory.files.find( f => f.uuid == selectedFile.uuid);
            file.status = selectedFile.status;
            file.observation = selectedFile.observation;
            return cat;
        });

        setBaremaList(newBaremaList);
        setModalOpen(false);
    }

    const onFileClick = (file: SubscriptionFile, categoryIndex:number, subCategoryIndex:number) => {
        setSelectedFile(file);
        setSelectedCategory(categoryIndex);
        setSelectedSubCategory(subCategoryIndex);
        setModalOpen(true);

    }



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
                                                                            <tr key={fileIndex} onClick={(e) => onFileClick(file, catIndex, subIndex)}>
                                                                                <td>
                                                                                    Arquivo nº {fileIndex + 1}
                                                                                </td>
                                                                                <td> {file.status}  </td>
                                                                                <td>  {file.observation || "-"}  </td>
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

            <BaremaModal open={modalOpen} file={selectedFile} onClose={onCloseModal} subCategory={baremaList[selectedCategory]?.categories[selectedSubCategory]} category={baremaList[selectedCategory]}></BaremaModal>
        </>
    );
}