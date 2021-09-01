import { ProcessStepsTypes, SelectiveProcess } from "./selective-process";
import { User } from "./user";

export interface Subscription {
    id?: string,
    uuid?: string,

    userID?: string,

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
    disability?: boolean,
    disabilityType?: string,
    specialTreatmentTypes?: string[],
    status?: SubscriptionStatus,
    files?: SubscriptionFileCategory[];
    selectiveProcessID?: string;
    reservedPlace?: string;

    age?: number;
    subscriptionDate: number;
    statusObservation?: string;
    observation?: string;
    graduationProofFile?: string;
    resources?: SubscriptionResource[];
    grades?: SubscriptionGrade[];
    interviewGrade?: number;
    testGrade?: number;

    //Only for UI
    currentResource?: SubscriptionResource;
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
    files: string[];
    
    //Only for UI
    formatedDate?: string;
}

export interface SubscriptionGrade{
    grade: number;
    step: ProcessStepsTypes;
}

export interface SubscriptionFileCategory{
    subcategoryID: string;
    files: SubscriptionFile[];
}

export interface SubscriptionFile{
    uuid: string;
    url: string;
    status: SubscriptionStatus;
    observation?: string;
}