import { Subscription } from "../models/subscription";
import firestore from "../utils/firestore-util";


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
            observation: doc['observation'],
            subscriptionDate : doc['subscriptionDate'],
            resources: doc['resources'],
            testGrade: doc['testGrade'],
            interviewGrade: doc['interviewGrade'],
        }

        return sub;
    }

    async function save(sub: Subscription) {
        subscriptionRef.add(sub);
    }

    async function update(sub: Subscription) {
        subscriptionRef.doc(sub.id).set(sub);
    }


    return {
        getAllByProcessID,
        getById,
        save,
        update
    }

}

