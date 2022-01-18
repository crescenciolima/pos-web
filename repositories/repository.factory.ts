import { AuthRepository } from "./auth.repository";
import { FirebaseAuthRepository } from "./firebase/firebase.auth.repository";
import { FirebaseRepository } from "./firebase/firebase.repository";
import { FirebaseStorageRepository } from "./firebase/firebase.storage-repository";
import { FirebaseTreatErrorRepository } from "./firebase/firebase.treat-error.repository";
import { Repository } from "./repository";
import { StorageRepository } from "./storage-repository";
import { TreatErrorRepository } from "./treat-error.repository";

export class RepositoryFactory{

    private static _repository:Repository = new FirebaseRepository();
    private static _authRepository:AuthRepository = new FirebaseAuthRepository();
    private static _treatErrorRepository:TreatErrorRepository = new FirebaseTreatErrorRepository();
    private static _storageRepository:StorageRepository = new FirebaseStorageRepository();

    static repository():Repository{
        return this._repository;
    }

    static authRepository():AuthRepository{
        return this._authRepository;
    }
    
    static treatErrorRepository():TreatErrorRepository{
        return this._treatErrorRepository;
    }
    
    static storageRepository():StorageRepository{
        return this._storageRepository;
    }
}