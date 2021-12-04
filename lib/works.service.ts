import { Works } from "../models/works";
import { firestore } from "../utils/firebase-admin";


export default function WorksService() {

    const worksRef = firestore.collection("works");

    async function getAll() {
        let worksList = [];

        await worksRef.orderBy('date', 'desc').get().then(
            (snapshot) => {
                snapshot.forEach(
                    (result) => {
                        const id = result.id;
                        const doc = result.data();
                        const works: Works = {
                            id: id,
                            title: doc['title'],
                            text: doc['text'],
                            url: doc['url'],
                            date: doc['date'],
                            authors: doc['authors']
                        }
                        worksList.push(works);
                    });

            }
        ).catch(
        );

        return worksList;

    }

    async function save(works: Works) {
       return worksRef.add(works);
    }

    async function update(works: Works) {
        worksRef.doc(works.id).set(works);
    }

    async function remove(teacherID: string) {
        await worksRef.doc(teacherID).delete();
    }

    async function getById(id) {
        let snapshot = await worksRef.doc(id).get();
        const doc = snapshot.data();
        const works: Works = {
            id: id,
            title: doc['title'],
            text: doc['text'],
            url: doc['url'],
            date: doc['date'],
            authors: doc['authors']
        }

        return works;
    }

    return {
        getAll,
        save,
        update,
        remove,
        getById,
    }

}

