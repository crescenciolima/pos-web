import { Course } from "../models/course";
import { SelectiveProcess } from "../models/selective-process";
import firestore from "../utils/firestore-util";


export default function SelectiveProcessService() {

    const selectiveProcessRef = firestore.collection("selectiveprocess");

    async function getInConstruction() {
        let snapshot = await selectiveProcessRef.where('inConstruction', '==', true).get();
        if(snapshot.size > 0){
            const doc = snapshot.docs[0];
            const data = doc.data();
            const selectiveProcess: SelectiveProcess = {
                id: doc.id,
                title: data['title'],
                open: data['open'],
                inConstruction: data['inConstruction'],
                numberPlaces: data['numberPlaces'],
                description: data['description'],
                reservedPlaces: data['reservedPlaces']
            }
            
            return selectiveProcess;
        }
        return null;
    }

    async function getAll() {
        let courses = [];

        await selectiveProcessRef.get().then(
            (snapshot) => {

                snapshot.forEach(
                    (result) => {
                        const id = result.id;
                        const doc = result.data();
                        const course: Course = {
                            id: id,
                            name: doc['name'],
                            description: doc['description'],
                        }
                        courses.push(course);
                    });

            }
        ).catch(
        );

        return courses;

    }

    async function save(process: SelectiveProcess) {
        selectiveProcessRef.add(process);
    }

    async function update(process: SelectiveProcess) {
        selectiveProcessRef.doc(process.id).update(process);
    }

    async function remove(course: Course) {
        selectiveProcessRef.doc(course.id).delete();
    }

    async function getById(id) {
        let snapshot = await selectiveProcessRef.doc(id).get();
        const doc = snapshot.data;
        const course: Course = {
            id: id,
            name: doc['name'],
            description: doc['description'],
        }

        return course;
    }


    return {
        getInConstruction,
        getAll,
        save,
        update,
        remove,
        getById
    }

}

