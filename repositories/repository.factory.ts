import { FirebaseRepository } from "./firebase/firebase.repository";
import { Repository } from "./repository";

export class RepositoryFactory{

    private static _repository:Repository = new FirebaseRepository();

    static repository():Repository{
        return this._repository;
    }

}