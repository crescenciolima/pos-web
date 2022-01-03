import { Course } from "../models/course";

export interface CourseServiceInterface{
    getAll():Promise<Course[]>;
    save(course: Course);
    update(course: Course);
    remove(course: Course);
    getById(id);
    getFirstCourse();

}