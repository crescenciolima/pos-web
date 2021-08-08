import { Subscription } from "../models/subscription";
import firestore from "../utils/firestore-util";


export default function SubscriptionService() {

    const subscriptionRef = firestore.collection("subscription");

    async function getAll() {
        let subscriptions = [];

        await subscriptionRef.get().then(
            (snapshot) => {

                snapshot.forEach(
                    (result) => {
                        const id = result.id;
                        const doc = result.data();
                        const subscription: Subscription = {
                            id: id,
                            student: doc['student'],
                            handicapped: doc['handicapped'],
                            disabilityType: doc['disabilityType'],
                            specialTreatmentType: doc['specialTreatmentType'],
                            vacancyType: doc['vacancyType'],  
                            status: doc['status'],
                        }
                        subscriptions.push(subscription);
                    });

            }
        ).catch(
        );

        return subscriptions;

    }

    async function save(subscription: Subscription) {
        subscriptionRef.add(subscription);
    }

    async function update(subscription: Subscription) {
        subscriptionRef.doc(subscription.id).set(subscription);
    }

    async function remove(subscription: Subscription) {
        subscriptionRef.doc(subscription.id).delete();
    }

    async function getById(id: any) {
        let snapshot = await subscriptionRef.doc(id).get();
        const doc = snapshot.data();
        const subscription: Subscription = {
            id: id,
            student: doc['student'],
            handicapped: doc['handicapped'],
            disabilityType: doc['disabilityType'],
            specialTreatmentType: doc['specialTreatmentType'],
            vacancyType: doc['vacancyType'],  
            status: doc['status'],
        }

        return subscription;
    }


    return {
        getAll,
        save,
        update,
        remove,
        getById
    }

}

