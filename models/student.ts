import { User } from "./user";

export interface Student {
    id?:string;
    uid?: string;

    name?: string;
    document?: string,
    identityDocument?: string,
    issuingAgency?: string,
    issuanceDate?: Date,
    birthdate?: Date;
    postalCode?: string,
    street?: string,
    houseNumber?: string,
    complement?: string,
    district?: string,
    city?: string,
    state?: string,
    phoneNumber?: string,
    homePhoneNumber?: string,
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

    user?: User
}