import { User } from "../models/user";

export class UserBuilder{

    private _user:User;

    constructor(){
        this._user = new User();
    }

    register(register: any): UserBuilder {
        this._user.id = register['id'];
        this._user.uid = register['uid'];
        this._user.name = register['name'];
        this._user.email = register['email'];
        this._user.password = register['password'];
        this._user.token = register['token'];
        this._user.type = register['type'];
        return this;
    }
    
    public id(id:string): UserBuilder{
        this._user.id = id;
        return this;
    }

    public uid(uid:string): UserBuilder{
        this._user.uid = uid;
        return this;
    }

    public token(token:string): UserBuilder{
        this._user.token = token;
        return this;
    }

    build(): User {
        return this._user;
    }

}