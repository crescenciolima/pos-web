import { Repository } from "../repository";
import { firestore } from "../../utils/firebase-admin";
import { injectable } from "inversify";
import { Builder } from "../../builders/builder";

@injectable()
export class FirebaseRepository implements Repository{

    private _collection;

    constructor(){}

    async getAll(table:string):Promise<any[]>{
        this._collection = firestore.collection(table);
        let objects = [];
        await this._collection.get().then(
            (snapshot) => {
                snapshot.forEach(
                    (result) => {
                        objects.push(result.data());
                    }
                );
            }
        ).catch();
        return objects;
    }
}