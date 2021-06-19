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
                        }
                        courses.push(course);
                    });

            }
        ).catch(
        );

        return courses;

    }

    async function save(course: Course, token: string) {
        courseRef.add(course);
    }

    async function update(course: Course, token: string) {
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
        }

        return course;
    }


    return {
        getAll,
        save,
        update,
        remove,
        getById
    }

}

