import { ProcessDocument } from "../subscription-process/process-document";
import { User } from "../user";
import { SubscriptionFileCategory } from "./subscription-file-category";
import { SubscriptionResource } from "./subscription-resource";
import { SubscriptionStatus } from "./subscription-resource.enum";

export class Subscription {
    id?: string;
    uuid?: string;

    userID?: string;

    name?: string;
    document?: string;
    identityDocument?: string;
    issuingAgency?: string;
    issuanceDate?: Date;
    birthdate?: Date;
    postalCode?: string;
    street?: string;
    houseNumber?: string;
    complement?: string;
    district?: string;
    city?: string;
    state?: string;
    phoneNumber?: string;
    alternativePhoneNumber?: string;
    graduation?: string;
    graduationInstitution?: string;
    postgraduateLatoSensu?: string;
    postgraduateLatoSensuInstitution?: string;
    postgraduateStrictoSensu?: string;
    postgraduateStrictoSensuInstitution?: string;

    profession?: string;
    company?: string;
    postalCodeCompany?: string;
    streetCompany?: string;
    houseNumberCompany?: string;
    complementCompany?: string;
    districtCompany?: string;
    cityCompany?: string;
    stateCompany?: string;
    phoneNumberCompany?: string;
    workShift?: string;
    workRegime?: string;

    protocol?: string;
    disability?: boolean;
    disabilityType?: string;
    specialTreatmentTypes?: string[];
    status?: SubscriptionStatus;
    files?: SubscriptionFileCategory[];
    selectiveProcessID?: string;
    reservedPlace?: string;
    processForms?: ProcessDocument[]; 

    age?: number;
    subscriptionDate?: string|Date;
    statusObservation?: string;
    observation?: string;
    graduationProofFile?: string;
    documentFile?: string;
    resources?: SubscriptionResource[];
    interviewGrade?: number;
    interviewObs?:string;
    testGrade?:number
    testObs?:string;

    //Only for UI
    currentResource?: SubscriptionResource;
    formatedDate?: string;
    placeName?:string;
}












