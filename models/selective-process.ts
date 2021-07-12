export interface SelectiveProcess {
    id?:string;
    title: string;
    open:boolean;
    inConstruction:boolean;
    creationDate?: number;
    numberPlaces?: number;
    description?: string;
    reservedPlaces?: ReservedPlace[];
    baremaCategories?: BaremaCategory[];
    processForms?: ProcessDocument[];
    processNotices?: ProcessDocument[];
}


export interface ReservedPlace {

    name:string;
    numberPlaces:number;

}


export interface BaremaCategory {

    name:string;
    maxPoints:number;
    subcategories: BaremaSubCategory[];
}


export interface BaremaSubCategory {

    name:string;
    points:number;

}

export interface ProcessDocument {

    name:string;
    url:string;

}