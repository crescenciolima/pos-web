export interface SelectiveProcess {
    id?:string;
    title: string;
    open:boolean;
    inConstruction:boolean;
    creationDate?: number;
    numberPlaces?: number;
    description?: string;
    reservedPlaces?: ReservedPlace[];

}


export interface ReservedPlace {

    name:string;
    numberPlaces:number;

}