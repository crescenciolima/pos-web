import { AuthRepository } from "../auth.repository";
import { Repository } from "../repository";
import { StorageRepository } from "../storage-repository";
import { TreatErrorRepository } from "../treat-error.repository";
import { MongoDbRepository } from "../mongodb/mongodb.repository";
import { MongoDbTreatErrorRepository } from "../mongodb/mongodb.treat-error.repository";
import { MongoDbAuthRepository } from "../mongodb/mongodb.auth.repository";
import { FirebaseStorageRepository } from "../firebase/firebase.storage-repository";
import { RepositoryFactory } from "./repository.factory";

export class MongoDbRepositoryFactory implements RepositoryFactory{

    private _repository:Repository;
    private _authRepository:AuthRepository;
    private _treatErrorRepository:TreatErrorRepository;
    private _storageRepository:StorageRepository;

    constructor(){
        this._repository = new MongoDbRepository();
        this._authRepository = new MongoDbAuthRepository(this._repository);
        this._treatErrorRepository = new MongoDbTreatErrorRepository();
        this._storageRepository = new FirebaseStorageRepository();

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