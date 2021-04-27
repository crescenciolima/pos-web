import { Teacher } from "../models/teacher";
import firestore from "../utils/firestore-util";


export default function TeacherService() {

    const docenteRef = firestore.collection("docente");

    async function getAll() {
        let docentes = [];

        await docenteRef.get().then(
            (snapshot) => {

                snapshot.forEach(
                    (result) => {
                        const id = result.id;
                        const doc = result.data();
                        const docente: Teacher = {
                            id: id,
                            name: doc['nome'],
                            about: doc['sobre'],
                            photo: doc['fotoUrl'],
                            phone: doc['telefone'],
                            email: doc['email'],
                        }
                        docentes.push(docente);
                    });

            }
        ).catch(
        );

        return docentes;

    }

    async function save(docente: Teacher) {
        docenteRef.add(docente);
    }

    async function update(docente: Teacher) {
        docenteRef.doc(docente.id).set(docente);
    }

    async function remove(docente: Teacher) {
        docenteRef.doc(docente.id).delete();
    }

    async function getById(id) {
        let snapshot = await docenteRef.doc(id).get();
        const doc = snapshot.data;
        const docente: Teacher = {
            id: id,
            name: doc['nome'],
            about: doc['sobre'],
            photo: doc['fotoUrl'],
            phone: doc['telefone'],
            email: doc['email'],
        }

        return docente;
    }


    return {
        getAll,
        save,
        update,
        remove,
        getById
    }

}

