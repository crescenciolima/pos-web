import { Comparator } from "../../utils/comparator";
import { Repository } from "../repository";
import { connectToDatabase } from '../../mongodb/mongodb';
import { FilteredResults } from "../../mongodb/filtered-results";
import { ObjectId } from "mongodb";

export class MongoDbRepository implements Repository{

    async getAll(table: string): Promise<any[]> {
        const { db } = await connectToDatabase();
        let listRegister = await db.collection(table).find({}).toArray();
        for(let register of listRegister){
            register['id'] = register._id;
        }
        return listRegister;
    }

    async save(table: string, object: any) {
        const { db } = await connectToDatabase();
        return await db.collection(table).insertOne(object);
    }

    async update(table: string, object: any) {
        const { db } = await connectToDatabase();
        return await db.collection(table).updateOne({_id: new ObjectId(object.id)}, {$set: object});
    }

    async remove(table: string, id: any) {
        const { db } = await connectToDatabase();
        return await db.collection(table).deleteOne({_id: new ObjectId(id)});
    }

    async get(table: string, id: any) {
        const { db } = await connectToDatabase();
        let register = await db.collection(table).findOne(new ObjectId(id));
        register['id'] = register._id;
        return register;
    }
    
    async find(table: string, comparator: Comparator) {
        const { db } = await connectToDatabase();
        let listRegister = await db.collection(table).find(FilteredResults.getResults(comparator)).toArray();
        for(let register of listRegister){
            register['id'] = register._id;
        }
        return listRegister;
    }

}