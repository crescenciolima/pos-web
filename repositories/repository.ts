import { Comparator } from "../utils/comparator";

export interface Repository{
    getAll(table:string):Promise<any[]>;
    save(table:string, object:any);
    update(table:string, object:any);
    remove(table:string, id:any);
    get(table:string, id:any);
    find(table:string, comparator:Comparator);
}