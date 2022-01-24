import { Course } from "../models/course";
import { Repository } from "../repositories/repository";
import { CourseBuilder } from "../builders/course.builder";
import { Comparator } from "../utils/comparator";
import { ComparatorEnum } from "../utils/comparator.enum";
import { GenerateFactory } from "../repositories/generate.factory";

export class CourseService {

    private repository:Repository;

    constructor(){
        this.repository = GenerateFactory.getInstance().repository();
    }

    async save(course: Course) {
        await this.repository.save("course", course);
    }

    async update(course: Course) {
        await this.repository.update("course", course);
    }

    async remove(id:any) {
        await this.repository.remove("course", id);
    }

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

    async getById(id) {
        let register = await this.repository.get("course", id);
        const course: Course = new CourseBuilder()
            .register(register)
        .build();
        return course;
    }

    async getFirstCourse() {
        let comparator:Comparator = new Comparator();
        comparator.add('name', null, ComparatorEnum.DIFFERENT);
        let courses = await this.repository.find("course", comparator);
        if (courses.length==0){
            return null
        }
        const course: Course = new CourseBuilder()
            .register(courses[0])
        .build();
        
        return course;
    }
}

