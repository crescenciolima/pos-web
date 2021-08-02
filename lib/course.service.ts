import { id } from "date-fns/locale";
import { Course } from "../models/course";
import firestore from "../utils/firestore-util";


export default function CourseService() {

    const courseRef = firestore.collection("course");

    async function getAll() {
        let courses = [];

        await courseRef.get().then(
            (snapshot) => {
                snapshot.forEach(
                    (result) => {
                        const id = result.id;
                        const doc = result.data();
                        const course: Course = {
                            id: id,
                            name: doc['name'],
                            description: doc['description'],
                            coordName: doc['coordName'],
                            coordMail: doc['coordMail'],
                            coordPhone: doc['coordPhone']
                        }
                        courses.push(course);
                    });

            }
        ).catch(
        );

        return courses;

    }

    async function save(course: Course) {
        courseRef.add(course);
    }

    async function update(course: Course) {
        courseRef.doc(course.id).set(course);
    }

    async function remove(course: Course) {
        courseRef.doc(course.id).delete();
    }

    async function getById(id) {
        let snapshot = await courseRef.doc(id).get();
        const doc = snapshot.data;
        const course: Course = {
            id: id,
            name: doc['name'],
            description: doc['description'],
            coordName: doc['coordName'],
            coordMail: doc['coordMail'],
            coordPhone: doc['coordPhone']
        }

        return course;
    }

    async function  getFirstCourse() {
        let snapshot = await courseRef.where('name','!=',null).get()

        //pior caso, retorna nada para uma collection vazia
        if (snapshot.empty){
            console.log("No course information found.")
            return null
        }
        //melhor caso, se nao está vazia recupera o primeiro doc da collection
        let name = snapshot.docs[0].data()['name']
        let description = snapshot.docs[0].data()['description']
        let coordName = snapshot.docs[0].data()['coordName']
        let coordMail = snapshot.docs[0].data()['coordMail']
        let coordPhone = snapshot.docs[0].data()['coordPhone']

        let course: Course = {
            name: name,
            description: description,
            coordName: coordName,
            coordMail: coordMail,
            coordPhone: coordPhone
        }

        //console.log("Value: %j",snapshot)

        return course;
    }


    return {
        getAll,
        save,
        update,
        remove,
        getById,
        getFirstCourse
    }

}

