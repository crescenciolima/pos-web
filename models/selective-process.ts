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
    currentStep?:number;
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
    INTERPOSICAO_RECURSO_INSCRICAO = "Recurso da Inscrição",
    HOMOLOGACAO_DEFINITIVA_INSCRICAO = "Homologação Definitiva Inscrição",
    ENTREVISTA = "Entrevista",
    RESULTADO_PRELIMINAR_ENTREVISTA = "Resultado Preliminar da Entrevista",
    INTERPOSICAO_RECURSO_ENTREVISTA = "Interposição de Recursos da Entrevista",
    RESULTADO_DEFINITIVO_ENTREVISTA = "Resultado Definitivo da Entrevista",
    PROVA = "Prova",
    RESULTADO_PRELIMINAR_PROVA = "Resultado Preliminar da Prova",
    INTERPOSICAO_RECURSO_PROVA = "Interposição de Recursos da Prova",
    RESULTADO_DEFINITIVO_PROVA = "Resultado Definitivo da Prova",
    AVALIACAO_BAREMA = "Avaliação Barema",
}


export enum ProcessStepsState {
    IN_CONSTRUCTION = "in_construction",
    OPEN = "open",
    FINISHED = "finished",
}