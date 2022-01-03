import { Course } from "../models/course";
import { Builder } from "./builder";

export class CourseBuilder implements Builder<Course>{

    private _course:Course;

    constructor(){
        this._course = new Course();
    }

    register(register: any): Builder<Course> {
        this._course.id = register['id'];
        this._course.name = register['name'];
        this._course.description = register['description'];
        this._course.coordName = register['coordName'];
        this._course.coordMail = register['coordMail'];
        this._course.coordPhone = register['coordPhone'];
        return this;
    }
    
    build(): Course {
        return this._course;
    }

}