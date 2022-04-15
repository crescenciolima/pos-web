import { AuthRepository } from "./auth.repository";
import { AlternativeRepositoryFactory } from "./factories/alternative-repository.factory";
import { FirebaseRepositoryFactory } from "./factories/firebase-repository.factory";
import { RepositoryFactory } from "./factories/repository.factory";
import { Repository } from "./repository";
import { StorageRepository } from "./storage-repository";
import { TreatErrorRepository } from "./treat-error.repository";
import { RepositoryMap } from "./repository.map";

export class GenerateFactory{

    static generateFactory:GenerateFactory;

    static getInstance():GenerateFactory{
        if(!GenerateFactory.generateFactory){
            GenerateFactory.generateFactory = new GenerateFactory();
        }
        return GenerateFactory.generateFactory;
    }

    private repositoryFactory:RepositoryFactory;

    constructor(){
        this.repositoryFactory = RepositoryMap.map.get(process.env.REPOSITORY);
    }

    repository():Repository{
        return this.repositoryFactory.repository();
    }

    authRepository():AuthRepository{
        return this.repositoryFactory.authRepository();
    }
    
    treatErrorRepository():TreatErrorRepository{
        return this.repositoryFactory.treatErrorRepository();
    }
    
    storageRepository():StorageRepository{
        return this.repositoryFactory.storageRepository();
    }
}