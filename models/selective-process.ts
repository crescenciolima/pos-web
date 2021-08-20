export interface SelectiveProcess {
    id?: string;
    title?: string;
    state?: ProcessStepsState;
    creationDate?: number;
    numberPlaces?: number;
    description?: string;
    reservedPlaces?: ReservedPlace[];
    baremaCategories?: BaremaCategory[];
    processForms?: ProcessDocument[];
    processNotices?: ProcessDocument[];
    steps?: ProcessStep[];
    currentStep?:ProcessStep;
}


export interface ReservedPlace {

    name: string;
    numberPlaces: number;
    uuid: string;

}


export interface BaremaCategory {

    name: string;
    maxPoints: number;
    subcategories: BaremaSubCategory[];
}


export interface BaremaSubCategory {

    uuid: string;
    name: string;
    points: number;

}

export interface ProcessDocument {

    name: string;
    url: string;

}


export interface ProcessStep {

    order:number;
    startDate: number;
    finishDate: number;
    weight: number;
    passingScore: number;
    type: ProcessStepsTypes;

}

export enum ProcessStepsTypes {
    INSCRICAO = "Inscrição",
    HOMOLOGACAO_PRELIMINAR_INSCRICAO = "Homologação Preliminar Inscrição",
    HOMOLOGACAO_DEFINITIVA_INSCRICAO = "Homologação Definitiva Inscrição",
    PROVA = "Prova",
    ENTREVISTA = "Entrevista",
    AVALIACAO_BAREMA = "Avaliação Barema",
    RECURSO_INSCRICAO = "Recurso da Inscrição",
}


export enum ProcessStepsState {
    IN_CONSTRUCTION = "in_construction",
    OPEN = "open",
    FINISHED = "finished",
}