import React, { useEffect, useState } from 'react'
import AdminBase from '../../components/admin/admin-base';
import Loading from '../../components/loading';
import API from '../../lib/api.service';
import { APIResponse } from '../../models/api-response';
import { APIRoutes } from '../../utils/api.routes';
import { format } from 'date-fns';
import { SelectiveProcess } from '../../models/subscription-process/selective-process';
import { ProcessStepsState } from '../../models/subscription-process/process-steps-state.enum';


export default function ResultsLayout() {

    const [selectedProcess, setSelectedProcess] = useState<SelectiveProcess>({ title: '', state: ProcessStepsState.IN_CONSTRUCTION });
    const [selectiveProcessList, setSelectiveProcessList] = useState<SelectiveProcess[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [hasProcess, setHasProcess] = useState<boolean>(false);


    const api = API(setLoading);

    useEffect(() => {

        api.get(APIRoutes.SELECTIVE_PROCESS, { 'all': "true" }).then(
            (result: APIResponse) => {
                if (result.result) {
                    const processList = result.result;

                    for (let process of processList) {
                        if(process.creationDate){
                            const data = new Date(process.creationDate);
                            process['data'] = format(data, 'dd/MM/yyyy')
                        }
                    }
                    setSelectiveProcessList(processList);
                    setSelectedProcess(processList[0]);
                    setHasProcess(true);
                }
            }
        )

    }, []);

    useEffect(() => {

        // api.get(APIRoutes.SELECTIVE_PROCESS, { 'all': "true" }).then(
        //     (result: APIResponse) => {
        //         if (result.result) {
        //             const processList = result.result;
        //             for(let process of processList){
        //                 const data = new Date(process.creationDate);
        //                 process['data'] = format(data, 'dd/MM/yyyy')
        //             }
        //             setSelectiveProcessList(processList);
        //             setSelectedProcess(processList[0]);
        //         }
        //     }
        // )

    }, [selectedProcess]);



    return (
        <AdminBase>
            <div className="row mb-2">
                <div className="col-6">
                    <h3 className="text-primary-dark">Resultados</h3>
                </div>

            </div>
            {(!isLoading) &&
                <>
                    <fieldset className="mt-5">
                        <legend>Selecione para ver os resultados</legend>
                        <div className="row mt-5">
                            <div className="col-12 table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Título</th>
                                            <th>Data</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectiveProcessList.map((process, i) => {
                                            return (
                                                <tr key={process.id} className={process.id == selectedProcess.id ? "table-success" : ""} onClick={(e) => { setSelectedProcess(process) }}>
                                                    <td>{process.title}</td>
                                                    <td>{process['data']}</td>
                                                    <td>{process.state == ProcessStepsState.OPEN ? 'Em andamento' : (process.state == ProcessStepsState.FINISHED) ? "Finalizado" : "Em construção"}</td>
                                                </tr>
                                            )
                                        })}

                                    </tbody>
                                </table>
                                {(selectiveProcessList.length == 0 && !isLoading) &&
                                    <div className="alert alert-info mt-3 text-center">
                                        Nenhum processo seletivo encontrado.
                                    </div>
                                }

                            </div>
                        </div>
                    </fieldset>

                    {hasProcess &&
                        <fieldset className="mt-5">
                            <legend>Resultado do {selectedProcess.title}</legend>
                            <div className="row mt-5">
                                <div className="col-12 table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Etapa</th>
                                                <th>Resultado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedProcess.steps.map((step, i) => {
                                                if (step.resultURL)
                                                    return (
                                                        <tr key={i}>
                                                            <td>{step.type}</td>
                                                            <td><a className="link-primary" target="_blank" href={step.resultURL}>Acessar arquivo do resultado</a></td>
                                                        </tr>
                                                    )
                                            })}

                                        </tbody>
                                    </table>
                                    {(selectedProcess.steps.filter(step => step.resultURL).length == 0 && !isLoading) &&
                                        <div className="alert alert-info mt-3 text-center">
                                            Nenhum resultado disponível para esse processo.
                                        </div>
                                    }

                                </div>
                            </div>
                        </fieldset>
                    }
                  
                </>
            }
            
            {isLoading &&
                <Loading />
            }
        </AdminBase>
    )
}

