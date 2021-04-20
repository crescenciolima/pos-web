import { Docente } from "../models/docente";
import firestore from "../utils/firestore-util";


export default function DocenteService() {

    const docenteRef = firestore.collection("docente");

    async function getAll() {
        let docentes = [];

        await docenteRef.get().then(
            (snapshot) => {

                snapshot.forEach(
                    (result) => {
                        const id = result.id;
                        const doc = result.data();
                        const docente: Docente = {
                            id: id,
                            nome: doc['nome'],
                            sobre: doc['sobre'],
                            fotoUrl: doc['fotoUrl'],
                            telefone: doc['telefone'],
                            email: doc['email'],
                        }
                        docentes.push(docente);
                    });

            }
        ).catch(
        );

        return docentes;

    }

    async function save(docente: Docente) {
        docenteRef.add(docente);
    }

    async function update(docente: Docente) {
        docenteRef.doc(docente.id).set(docente);
    }

    async function remove(docente: Docente) {
        docenteRef.doc(docente.id).delete();
    }

    async function getById(id) {
        let snapshot = await docenteRef.doc(id).get();
        const doc = snapshot.data;
        const docente: Docente = {
            id: id,
            nome: doc['nome'],
            sobre: doc['sobre'],
            fotoUrl: doc['fotoUrl'],
            telefone: doc['telefone'],
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

