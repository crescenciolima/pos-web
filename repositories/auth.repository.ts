import { AuthError } from "../models/auth.error";
import { User } from "../models/user";

export interface AuthRepository{
    signUp(user: User):Promise<User|AuthError>;
    signIn(user: User):Promise<User|AuthError>;
    signOut():Promise<boolean|AuthError>;
    removeUser(user: User):Promise<boolean|AuthError>;
    forgotPassword(user: User):Promise<boolean|AuthError>;
    verifyPasswordResetCode(code: string):Promise<string|AuthError>;
    confirmPasswordReset(code: string, newPassword: string):Promise<boolean|AuthError>;
    updateUser(user: User):Promise<boolean|AuthError>;
    currentUser(authorization: string):Promise<boolean|string>;
    verifyIdToken(token:string);
}