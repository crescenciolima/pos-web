import { AuthError } from "../models/auth.error";
import { Builder } from "./builder";

export class AuthErrorBuilder{

    private _authError:AuthError;

    constructor(){
        this._authError = new AuthError();
        this._authError.error = true;
    }

    message(message:string){
        this._authError.message = message;
        return this;
    }
    
    build(): AuthError {
        return this._authError;
    }

}