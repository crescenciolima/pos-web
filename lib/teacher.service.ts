import { Teacher } from "../models/teacher";
import firestore from "../utils/firestore-util";


export default function TeacherService() {

    const docenteRef = firestore.collection("teacher");

    async function getAll() {
        let docentes = [];

        await docenteRef.get().then(
            (snapshot) => {

                snapshot.forEach(
                    (result) => {
                        const id = result.id;
                        const doc = result.data();
                        const teacher: Teacher = {
                            id: id,
                            name: doc['name'],
                            about: doc['about'],
                            photo: doc['photo'],
                            phone: doc['phone'],
                            email: doc['email'],
                        }
                        docentes.push(teacher);
                    });

            }
        ).catch(
        );

        return docentes;

    }

    async function save(teacher: Teacher) {
        docenteRef.add(teacher);
    }

    async function update(teacher: Teacher) {
        docenteRef.doc(teacher.id).set(teacher);
    }

    async function remove(teacherID: string) {
        await docenteRef.doc(teacherID).delete();
    }

    async function getById(id) {
        let snapshot = await docenteRef.doc(id).get();
        const doc = snapshot.data();
        const teacher: Teacher = {
            id: id,
            name: doc['name'],
            about: doc['about'],
            photo: doc['photo'],
            phone: doc['phone'],
            email: doc['email'],
        }

        return teacher;
    }


    return {
        getAll,
        save,
        update,
        remove,
        getById
    }

}

