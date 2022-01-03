import { id } from "date-fns/locale";
import { Course } from "../models/course";
import { firestore } from "../utils/firebase-admin";
import { CourseServiceInterface } from "./course.service.interface";
import { inject, injectable } from "inversify";
import { Repository } from "../repositories/repository";
import { CourseBuilder } from "../builders/course.builder";

@injectable()
export class CourseService implements CourseServiceInterface {

    constructor(
        @inject(TYPES.Repository) protected repository: Repository
    ){}

    async getAll():Promise<Course[]> {
        let courses:Course[] = [];
        let listCourseRegister = await this.repository.getAll("course");
        for(let courseRegister of listCourseRegister){
            const course: Course = new CourseBuilder()
                .register(courseRegister)
            .build();
            courses.push(course);
        }
        return courses;
    }

    async save(course: Course) {
        courseRef.add(course);
    }

    async update(course: Course) {
        courseRef.doc(course.id).set(course);
    }

    async remove(course: Course) {
        courseRef.doc(course.id).delete();
    }

    async getById(id) {
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

    async getFirstCourse() {
        let snapshot = await courseRef.where('name','!=',null).get()

        //pior caso, retorna nada para uma collection vazia
        if (snapshot.empty){
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


        return course;
    }
}

