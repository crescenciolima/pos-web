import { Works } from "../models/works";
import { Repository } from "../repositories/repository";
import { GenerateFactory } from "../repositories/generate.factory";
import { WorksBuilder } from "../builders/works.builder";


export class WorksService {

    private repository:Repository;

    constructor(){
        this.repository = GenerateFactory.getInstance().repository();
    }

    async getAll() {
        let listWorks:Works[] = [];
        let listWorksRegister = await this.repository.getAll('works');
        for (let subscriptionRegister of listWorksRegister) {
            const subscription:Works = new WorksBuilder()
                .register(subscriptionRegister)
            .build();
            listWorks.push(subscription);
        }
        return listWorks;
    }

    async save(works: Works) {
        return await this.repository.save("works", works);
    }

    async update(works: Works) {
        return await this.repository.update("works", works);
    }

    async remove(worksId: string) {
        await this.repository.remove("works", worksId);
    }

    async getById(id) {
        let worksRegister = await this.repository.get('works', id);
        const works: Works = new WorksBuilder()
            .register(worksRegister)
        .build();
        return works;
    }
}

