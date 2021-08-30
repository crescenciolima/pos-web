import { ProcessStepsTypes, SelectiveProcess } from "./selective-process";
import { User } from "./user";

export interface Subscription {
    id?: string,
    uid?: string,

    user?: User

    name?: string,
    document?: string,
    identityDocument?: string,
    issuingAgency?: string,
    issuanceDate?: Date,
    birthdate?: Date,
    postalCode?: string,
    street?: string,
    houseNumber?: string,
    complement?: string,
    district?: string,
    city?: string,
    state?: string,
    phoneNumber?: string,
    alternativePhoneNumber?: string,
    graduation?: string,
    graduationInstitution?: string,
    postgraduateLatoSensu?: string,
    postgraduateLatoSensuInstitution?: string,
    postgraduateStrictoSensu?: string,
    postgraduateStrictoSensuInstitution?: string,

    profession?: string,
    company?: string,
    postalCodeCompany?: string,
    streetCompany?: string,
    houseNumberCompany?: string,
    complementCompany?: string,
    districtCompany?: string,
    cityCompany?: string,
    stateCompany?: string,
    phoneNumberCompany?: string,
    workShift?: string,
    workRegime?: string,

    protocol?: string,
    handicapped?: boolean,
    disabilityType?: string,
    specialTreatmentTypes?: string[],
    vacancyType?: string,    
    status?: SubscriptionStatus,

    age?: number;
    subscriptionDate: number;
    selectiveProcessID?: string;
    statusObservation?: string;
    reservedPlace?: string;
    observation?: string;
    graduationProofFile?: string;
    resources?: SubscriptionResource[];
    interviewGrade?: number;
    testGrade?:number


    //Only for UI
    currentResource?: SubscriptionResource;
    formatedDate?: string;
}


export enum SubscriptionStatus {
    AGUARDANDO_ANALISE = "Aguardando Análise",
    DEFERIDA = "Deferida",
    INDEFERIDA = "Indeferida",
    REPROVADO = "Reprovado",
}


export interface SubscriptionResource {

    justification: string;
    date: number;
    step: ProcessStepsTypes;
    status: SubscriptionStatus;
    statusObservation?: string;
    files: string[];
    
    //Only for UI
    formatedDate?: string;
}

export interface SubscriptionGrade{
    grade: number;
    step: ProcessStepsTypes;
}