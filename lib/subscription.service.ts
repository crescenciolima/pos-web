import { Subscription } from "../models/subscription";
import { firestore } from "../utils/firebase-admin";


export default function SubscriptionService() {

    const subscriptionRef = firestore.collection("subscription");

    async function getAllByProcessID(id: string) {
        let snapshot = await subscriptionRef.where('selectiveProcessID', "==", id).get();
        if (snapshot.size > 0) {
            let subs = [];

            snapshot.forEach(
                (result) => {
                    const id = result.id;
                    const doc = result.data();
                    const sub: Subscription = {
                        id: id,
                        protocol: doc['protocol'],
                        name: doc['name'],
                        age: doc['age'],
                        selectiveProcessID: doc['selectiveProcessID'],
                        status: doc['status'],
                        statusObservation: doc['statusObservation'],
                        reservedPlace: doc['reservedPlace'],
                        graduationProofFile: doc['graduationProofFile'],
                        subscriptionDate : doc['subscriptionDate'],
                        resources: doc['resources'],
                        testGrade: doc['testGrade'],
                        interviewGrade: doc['interviewGrade'],
                        files:doc['files'],
                        testObs:doc['testObs'],
                        interviewObs:doc['interviewObs'],
                    }
                    subs.push(sub);
                });
            return subs;

        }
        return null;
    }

    async function getById(id) {
        let snapshot = await subscriptionRef.doc(id).get();
        const doc = snapshot.data();

        return buildSubscription(id, doc);
    }

    async function getByUserAndProcess(userID, selectiveProcessID) {
        let snapshot = await subscriptionRef
        .where('userID', "==", userID)
        .where('selectiveProcessID', "==", selectiveProcessID)
        .get();
        console.log(snapshot.size)
        if (snapshot.size > 0) {                  
            let subs = [];
            snapshot.forEach(
                (result) => {
                    const id = result.id;
                    const doc = result.data();
                    const sub: Subscription = buildSubscription(id, doc)
                    subs.push(sub);
                });     
            const doc = subs[0];
            return doc;
        }

        return null;
    }


    async function save(sub: Subscription) {
        return subscriptionRef.add(sub);
    }

    async function update(sub: Subscription) {
        subscriptionRef.doc(sub.id).update(sub);
    }

    function buildSubscription(id, doc) {
        const sub: Subscription = {
            id: id,

            userID: validateField(doc['userID']),        
            name: validateField(doc['name']),
            document: validateField(doc['document']),
            identityDocument: validateField(doc['identityDocument']),
            issuingAgency: validateField(doc['issuingAgency']),
            issuanceDate: validateField(doc['issuanceDate']),
            birthdate: validateField(doc['birthdate']),
            postalCode: validateField(doc['postalCode']),
            street: validateField(doc['street']),
            houseNumber: validateField(doc['houseNumber']),
            complement: validateField(doc['complement']),
            district: validateField(doc['district']),
            city: validateField(doc['city']),
            state: validateField(doc['state']),
            phoneNumber: validateField(doc['phoneNumber']),
            alternativePhoneNumber: validateField(doc['alternativePhoneNumber']),
            graduation: validateField(doc['graduation']),
            graduationInstitution: validateField(doc['graduationInstitution']),
            postgraduateLatoSensu: validateField(doc['postgraduateLatoSensu']),
            postgraduateLatoSensuInstitution: validateField(doc['postgraduateLatoSensuInstitution']),
            postgraduateStrictoSensu: validateField(doc['postgraduateStrictoSensu']),
            postgraduateStrictoSensuInstitution: validateField(doc['postgraduateStrictoSensuInstitution']),
        
            profession: validateField(doc['profession']),
            company: validateField(doc['company']),
            postalCodeCompany: validateField(doc['postalCodeCompany']),
            streetCompany: validateField(doc['streetCompany']),
            houseNumberCompany: validateField(doc['houseNumberCompany']),
            complementCompany: validateField(doc['complementCompany']),
            districtCompany: validateField(doc['districtCompany']),
            cityCompany: validateField(doc['cityCompany']),
            stateCompany: validateField(doc['stateCompany']),
            phoneNumberCompany: validateField(doc['phoneNumberCompany']),
            workShift: validateField(doc['workShift']),
            workRegime: validateField(doc['workRegime']),
        
            protocol: validateField(doc['protocol']),
            disability: validateField(doc['disability']),
            disabilityType: validateField(doc['disabilityType']),
            specialTreatmentTypes: validateField(doc['specialTreatmentTypes']),
            status: validateField(doc['status']),
            files: validateField(doc['files']),
            selectiveProcessID: validateField(doc['selectiveProcessID']),
            reservedPlace: validateField(doc['reservedPlace']),

            subscriptionDate : validateField(doc['subscriptionDate']),

            graduationProofFile: validateField(doc['graduationProofFile']),
            documentFile: validateField(doc['documentFile']),
            processForms: validateField(doc['processForms'], 'array'),

            testGrade: validateField(doc['testGrade']),
            interviewGrade: validateField(doc['interviewGrade']),
            testObs:validateField(doc['testObs']),
            interviewObs:validateField(doc['interviewObs']),
            statusObservation: validateField(doc['statusObservation']),
            observation: validateField(doc['observation']),
            resources: validateField(doc['resources'], 'array'),

            age: validateField(doc['age']),

        }

        return sub;
    }
    function validateField(field, defaultValue = 'string') {
        return field ? field : (defaultValue === 'string' ? '' : []);
    }

    return {
        getAllByProcessID,
        getById,
        getByUserAndProcess,
        save,
        update
    }

}

