import { Repository } from "../repository";
import { firestore } from "../../firebase/firebase-admin";
import { Comparator } from "../../utils/comparator";
import { FilteredResults } from "../../utils/filtered-results";

export class FirebaseRepository implements Repository{

    private _collection:FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

    constructor(){}

    async getAll(table:string):Promise<any[]>{
        this._collection = firestore.collection(table);
        let objects = [];
        await this._collection.get().then(
            (snapshot) => {
                snapshot.forEach(
                    (result) => {
                        let register = result.data();
                        register.id = result.id;
                        objects.push(register);
                    }
                );
            }
        ).catch();
        return objects;
    }

    async save(table:string, object:any){
        this._collection = firestore.collection(table);
        this._collection.add(object);
    }

    async update(table:string, object:any) {
        this._collection = firestore.collection(table);
        this._collection.doc(object.id).set(object);
    }

    async remove(table:string, id:any) {
        this._collection = firestore.collection(table);
        this._collection.doc(id).delete();
    }

    async get(table:string, id:any) {
        this._collection = firestore.collection(table);
        let snapshot = await this._collection.doc(id).get();
        let register = snapshot.data();
        register.id = snapshot.id;
        return register;
    }
    
    async find(table:string, comparator:Comparator) {
        this._collection = firestore.collection(table);
        let objects = [];
        await FilteredResults.getResults(this._collection, comparator).then(
            (snapshot) => {
                snapshot.forEach(
                    (result) => {
                        let register = result.data();
                        register.id = result.id;
                        objects.push(register);
                    }
                );
            }
        ).catch();
        return objects;
    }
}