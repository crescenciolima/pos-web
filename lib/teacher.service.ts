import { Teacher } from "../models/teacher";
import { Repository } from "../repositories/repository";
import { GenerateFactory } from "../repositories/generate.factory";
import { TeacherBuilder } from "../builders/teacher.builder";


export class TeacherService {

    private repository:Repository;

    constructor(){
        this.repository = GenerateFactory.getInstance().repository();
    }

    async getAll() {
        let listTeacher:Teacher[] = [];
        console.log('-----------------------------');
        console.log('TeacherService.getAll');
        console.log('inicial: ', new Date());
        let listTeacherRegister = await this.repository.getAll('teacher');
        console.log('final: ', new Date());
        console.log('-----------------------------');
        for (let subscriptionRegister of listTeacherRegister) {
            const subscription:Teacher = new TeacherBuilder()
                .register(subscriptionRegister)
            .build();
            listTeacher.push(subscription);
        }
        return listTeacher;
    }

    async save(teacher: Teacher) {
        console.log('-----------------------------');
        console.log('TeacherService.save');
        console.log('inicial: ', new Date());
        teacher = await this.repository.save("teacher", teacher);
        console.log('final: ', new Date());
        console.log('-----------------------------');
        return teacher;
    }

    async update(teacher: Teacher) {
        return await this.repository.update("teacher", teacher);
    }

    async remove(teacherID: string) {
        await this.repository.remove("teacher", teacherID);
    }

    async getById(id) {
        let teacherRegister = await this.repository.get('teacher', id);
        const teacher: Teacher = new TeacherBuilder()
            .register(teacherRegister)
        .build();
        return teacher;
    }
}

