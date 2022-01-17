import { AuthRepository } from "./auth.repository";
import { FirebaseAuthRepository } from "./firebase/firebase.auth.repository";
import { FirebaseRepository } from "./firebase/firebase.repository";
import { Repository } from "./repository";

export class RepositoryFactory{

    private static _repository:Repository = new FirebaseRepository();

    private static _authRepository:AuthRepository = new FirebaseAuthRepository();

    static repository():Repository{
        return this._repository;
    }

    static authRepository():AuthRepository{
        return this._authRepository;
    }
}