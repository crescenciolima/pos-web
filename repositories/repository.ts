export interface Repository{
    getAll(table:string):Promise<any[]>;
}