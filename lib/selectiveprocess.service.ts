import { ProcessStep, ProcessStepsState, SelectiveProcess } from "../models/selective-process";
import { firestore } from "../utils/firebase-admin";


export default function SelectiveProcessService() {

    const selectiveProcessRef = firestore.collection("selectiveprocess");

    async function getInConstruction() {
        let snapshot = await selectiveProcessRef.where('state', "in", [ProcessStepsState.IN_CONSTRUCTION, ProcessStepsState.OPEN]).get();
        if (snapshot.size > 0) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            const selectiveProcess: SelectiveProcess = {
                id: doc.id,
                title: data['title'],
                state: data['state'],
                numberPlaces: data['numberPlaces'],
                description: data['description'],
                reservedPlaces: data['reservedPlaces'],
                baremaCategories: data['baremaCategories'],
                processForms: data['processForms'],
                processNotices: data['processNotices'],
                steps: data['steps'],
                currentStep: data['currentStep']

            }

            return selectiveProcess;
        }
        return null;
    }


    async function getOpen() {
        let snapshot = await selectiveProcessRef.where('state', "==", ProcessStepsState.OPEN).get();
        if (snapshot.size > 0) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            const selectiveProcess: SelectiveProcess = {
                id: doc.id,
                title: data['title'],
                state: data['state'],
                numberPlaces: data['numberPlaces'],
                description: data['description'],
                reservedPlaces: data['reservedPlaces'],
                baremaCategories: data['baremaCategories'],
                processForms: data['processForms'],
                processNotices: data['processNotices'],
                steps: data['steps'],
                currentStep: data['currentStep']

            }

            return selectiveProcess;
        }
        return null;
    }

    async function getAll() {
        let processList = [];

        await selectiveProcessRef.get().then(
            (snapshot) => {
                snapshot.forEach(
                    (result) => {
                        const id = result.id;
                        const doc = result.data();
                        const selectiveProcess: SelectiveProcess = {
                            id: id,
                            title: doc['title'],
                            creationDate: doc['creationDate'],
                            state: doc['state'],
                            numberPlaces: doc['numberPlaces'],
                            description: doc['description'],
                            reservedPlaces: doc['reservedPlaces'],
                            baremaCategories: doc['baremaCategories'],
                            processForms: doc['processForms'],
                            processNotices: doc['processNotices'],
                            steps: doc['steps'],
                            currentStep: doc['currentStep']

                        }
                        processList.push(selectiveProcess);
                    });

            }
        ).catch(
        );

        return processList;
    }


    async function save(process: SelectiveProcess): Promise<any> {
        return selectiveProcessRef.add(process);
    }

    async function update(process: SelectiveProcess) {
        selectiveProcessRef.doc(process.id).update(process);
    }

    async function remove(process: SelectiveProcess) {
        selectiveProcessRef.doc(process.id).delete();
    }

    async function getById(id) {
        let snapshot = await selectiveProcessRef.doc(id).get();
        const doc = snapshot.data();
        const process: SelectiveProcess = {
            id: id,
            title: doc['title'],
            state: doc['state'],
            numberPlaces: doc['numberPlaces'],
            description: doc['description'],
            reservedPlaces: doc['reservedPlaces'],
            baremaCategories: doc['baremaCategories'],
            processForms: doc['processForms'],
            processNotices: doc['processNotices'],
            steps: doc['steps'],
            currentStep: doc['currentStep']

        }
        return process;
    }


    return {
        getInConstruction,
        save,
        update,
        remove,
        getById,
        getOpen,
        getAll
    }

}

