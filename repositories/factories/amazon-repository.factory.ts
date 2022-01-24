import { AuthRepository } from "../auth.repository";
import { Repository } from "../repository";
import { StorageRepository } from "../storage-repository";
import { TreatErrorRepository } from "../treat-error.repository";
import { MongoDbRepository } from "../mongodb/mongodb.repository";
import { AmazonAuthRepository } from '../amazon/amazon.auth.repository'
import { AmazonTreatErrorRepository } from '../amazon/amazon.treat-error.repository'
import { FilemanagerStorageRepository } from '../filemanager/filemanager.storage-repository'
import { RepositoryFactory } from "./repository.factory";

export class AmazonRepositoryFactory implements RepositoryFactory{

    private _repository:Repository;
    private _authRepository:AuthRepository;
    private _treatErrorRepository:TreatErrorRepository;
    private _storageRepository:StorageRepository;

    constructor(){
        this._repository = new MongoDbRepository();
        this._authRepository = new AmazonAuthRepository(this._repository);
        this._treatErrorRepository = new AmazonTreatErrorRepository();
        this._storageRepository = new FilemanagerStorageRepository();
    }

    repository():Repository{
        return this._repository;
    }

    authRepository():AuthRepository{
        return this._authRepository;
    }
    
    treatErrorRepository():TreatErrorRepository{
        return this._treatErrorRepository;
    }
    
    storageRepository():StorageRepository{
        return this._storageRepository;
    }
}