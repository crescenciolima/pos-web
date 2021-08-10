import { ProcessStepsTypes } from "./selective-process";

export interface Subscription {

    id: string;
    protocol: string;
    name: string;
    age: number;
    subscriptionDate: number;
    selectiveProcessID: string;
    status: SubscriptionStatus;
    statusObservation?: string;
    reservedPlace: string;
    observation?: string;
    graduationProofFile: string;
    resources?: SubscriptionResource[];
    grades?: SubscriptionGrade[];
    //Only for UI
    currentResource?: SubscriptionResource;
    currentGrade?: SubscriptionGrade;
    formatedDate?: string;
}


export enum SubscriptionStatus {
    AGUARDANDO_ANALISE = "Aguardando Análise",
    DEFERIDA = "Deferida",
    INDEFERIDA = "Indeferida",
}


export interface SubscriptionResource {

    justification: string;
    date: number;
    step: ProcessStepsTypes;
    status: SubscriptionStatus;
    statusObservation?: string;

    //Only for UI
    formatedDate?: string;
}

export interface SubscriptionGrade{

    grade: number;
    step: ProcessStepsTypes;

}