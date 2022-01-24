import { SelectiveProcessBuilder } from "../builders/selective-process.builder";
import { ProcessStepsState } from "../models/subscription-process/process-steps-state.enum";
import { SelectiveProcess } from "../models/subscription-process/selective-process";
import { Repository } from "../repositories/repository";
import { GenerateFactory } from "../repositories/generate.factory";
import { Comparator } from "../utils/comparator";
import { ComparatorEnum } from "../utils/comparator.enum";


export class SelectiveProcessService {

    private repository:Repository;

    constructor(){
        this.repository = GenerateFactory.getInstance().repository();
    }

    async getInConstruction() {
        let comparator:Comparator = new Comparator();
        comparator.add('state', [ProcessStepsState.IN_CONSTRUCTION, ProcessStepsState.OPEN], ComparatorEnum.IN);
        let listSelectiveProcess = await this.repository.find('selectiveprocess', comparator);
        if (listSelectiveProcess.length > 0) {
            const selectiveProcess:SelectiveProcess = new SelectiveProcessBuilder()
                .register(listSelectiveProcess[0])
            .build();
            return selectiveProcess;
        }
        return null;
    }


    async getOpen() {
        let comparator:Comparator = new Comparator();
        comparator.add('state', ProcessStepsState.OPEN, ComparatorEnum.EQUAL);
        let listSelectiveProcess = await this.repository.find('selectiveprocess', comparator);
        if (listSelectiveProcess.length > 0) {
            const selectiveProcess:SelectiveProcess = new SelectiveProcessBuilder()
                .register(listSelectiveProcess[0])
            .build();
            return selectiveProcess;
        }
        return null;
    }

    async getAll() {
        let listSelectiveProcess:SelectiveProcess[] = [];
        let listSelectiveProcessRegister = await this.repository.getAll("selectiveprocess");
        for(let selectiveProcessRegister of listSelectiveProcessRegister){
            const selectiveProcess: SelectiveProcess = new SelectiveProcessBuilder()
                .register(selectiveProcessRegister)
            .build();
            listSelectiveProcess.push(selectiveProcess);
        }
        return listSelectiveProcess;
    }


    async save(process: SelectiveProcess): Promise<any> {
        return await this.repository.save("selectiveprocess", process);
    }

    async update(process: SelectiveProcess) {
        await this.repository.update("selectiveprocess", process);
    }

    async remove(process: SelectiveProcess) {
        await this.repository.remove("selectiveprocess", process.id);
    }

    async getById(id) {
        let selectiveProcessRegister = await this.repository.get("selectiveprocess", id);
        const process: SelectiveProcess = new SelectiveProcessBuilder()
            .register(selectiveProcessRegister)
        .build();
        return process;
    }
}

