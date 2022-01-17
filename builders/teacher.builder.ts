import { Teacher } from "../models/teacher";
import { Builder } from "./builder";

export class TeacherBuilder implements Builder<Teacher>{

    private _teacher:Teacher;

    constructor(){
        this._teacher = new Teacher();
    }

    register(register: any): Builder<Teacher> {
        this._teacher.id = register['id'];
        this._teacher.name = register['name'],
        this._teacher.about = register['about'],
        this._teacher.photo = register['photo'],
        this._teacher.email = register['email'],
        this._teacher.phone = register['phone']
        return this;
    }
    
    build(): Teacher {
        return this._teacher;
    }

}