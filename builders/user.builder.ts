import { User } from "../models/user";
import { Builder } from "./builder";

export class UserBuilder implements Builder<User>{

    private _user:User;

    constructor(){
        this._user = new User();
    }

    register(register: any): Builder<User> {
        this._user.id = register['id'];
        this._user.uid = register['uid'];
        this._user.name = register['name'];
        this._user.email = register['email'];
        this._user.password = register['password'];
        this._user.token = register['token'];
        this._user.type = register['type'];
        return this;
    }
    
    build(): User {
        return this._user;
    }

}