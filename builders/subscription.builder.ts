import { Subscription } from "../models/subscription/subscription";
import { Builder } from "./builder";

export class SubscriptionBuilder implements Builder<Subscription>{

    private _subscription:Subscription;

    constructor(){
        this._subscription = new Subscription();
    }

    register(register: any): Builder<Subscription> {
        this._subscription.id = register['id'];
        this._subscription.uuid = register['uuid'];
        this._subscription.userID = register['userID'];
        this._subscription.name = register['name'];
        this._subscription.document = register['document'];
        this._subscription.identityDocument = register['identityDocument'];
        this._subscription.issuingAgency = register['issuingAgency'];
        this._subscription.issuanceDate = register['issuanceDate'];
        this._subscription.birthdate = register['birthdate'];
        this._subscription.postalCode = register['postalCode'];
        this._subscription.street = register['street'];
        this._subscription.houseNumber = register['houseNumber'];
        this._subscription.complement = register['complement'];
        this._subscription.district = register['district'];
        this._subscription.city = register['city'];
        this._subscription.state = register['state'];
        this._subscription.phoneNumber = register['phoneNumber'];
        this._subscription.alternativePhoneNumber = register['alternativePhoneNumber'];
        this._subscription.graduation = register['graduation'];
        this._subscription.graduationInstitution = register['graduationInstitution'];
        this._subscription.postgraduateLatoSensu = register['postgraduateLatoSensu'];
        this._subscription.postgraduateLatoSensuInstitution = register['postgraduateLatoSensuInstitution'];
        this._subscription.postgraduateStrictoSensu = register['postgraduateStrictoSensu'];
        this._subscription.postgraduateStrictoSensuInstitution = register['postgraduateStrictoSensuInstitution'];
        this._subscription.profession = register['profession'];
        this._subscription.company = register['company'];
        this._subscription.postalCodeCompany = register['postalCodeCompany'];
        this._subscription.streetCompany = register['streetCompany'];
        this._subscription.houseNumberCompany = register['houseNumberCompany'];
        this._subscription.complementCompany = register['complementCompany'];
        this._subscription.districtCompany = register['districtCompany'];
        this._subscription.cityCompany = register['cityCompany'];
        this._subscription.stateCompany = register['stateCompany'];
        this._subscription.phoneNumberCompany = register['phoneNumberCompany'];
        this._subscription.workShift = register['workShift'];
        this._subscription.workRegime = register['workRegime'];
        this._subscription.protocol = register['protocol'];
        this._subscription.disability = register['disability'];
        this._subscription.disabilityType = register['disabilityType'];
        this._subscription.specialTreatmentTypes = register['specialTreatmentTypes'];
        this._subscription.status = register['status'];
        this._subscription.files = register['files'];
        this._subscription.selectiveProcessID = register['selectiveProcessID'];
        this._subscription.reservedPlace = register['reservedPlace'];
        this._subscription.processForms = register['processForms'] || [];
        this._subscription.age = register['age'];
        this._subscription.subscriptionDate = register['subscriptionDate'];
        this._subscription.statusObservation = register['statusObservation'];
        this._subscription.observation = register['observation'];
        this._subscription.graduationProofFile = register['graduationProofFile'];
        this._subscription.documentFile = register['documentFile'];
        this._subscription.resources = register['resources'] || [];
        this._subscription.interviewGrade = register['interviewGrade'];
        this._subscription.interviewObs = register['interviewObs'];
        this._subscription.testGrade = register['testGrade'];
        this._subscription.testObs = register['testObs'];
        this._subscription.currentResource = register['currentResource'];
        this._subscription.formatedDate = register['formatedDate'];
        this._subscription.placeName = register['placeName'];
        return this;
    }
    
    build(): Subscription {
        return this._subscription;
    }

}