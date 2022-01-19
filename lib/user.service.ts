import { User } from "../models/user";
import { Repository } from "../repositories/repository";
import { RepositoryFactory } from "../repositories/repository.factory";
import { UserBuilder } from "../builders/user.builder";


export class UserService {

    private repository:Repository;

    constructor(){
        this.repository = RepositoryFactory.repository();
    }

    async getAll() {
        let listUser:User[] = [];
        let listUserRegister = await this.repository.getAll('user');
        for (let subscriptionRegister of listUserRegister) {
            const subscription:User = new UserBuilder()
                .register(subscriptionRegister)
            .build();
            listUser.push(subscription);
        }
        return listUser;
    }

    async save(user: User) {
        let ret = await this.repository.save("user", user);
        return ret;
    }

    async update(user: User) {
        return await this.repository.update("user", user);
    }

    async remove(user: User) {
        await this.repository.remove("user", user.id);
    }

    async getById(id) {
        let userRegister = await this.repository.get('user', id);
        const user: User = new UserBuilder()
            .register(userRegister)
        .build();
        return user;
    }
}

