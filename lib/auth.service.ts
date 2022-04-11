import { User } from "../models/user";
import { NextApiRequest, NextApiResponse } from "next";
import { NextApiRequestWithFormData } from "../utils/types-util";
import { AuthRepository } from "../repositories/auth.repository";
import { GenerateFactory } from "../repositories/generate.factory";

export class AuthService {
    
    private authRepository:AuthRepository;

    constructor(){
        this.authRepository = GenerateFactory.getInstance().authRepository();
    }

    async signUp(user: User,  res: NextApiResponse) {
        return await this.authRepository.signUp(user);
    }

    async signIn(user: User) {
        console.log('-----------------------------');
        console.log('AuthService.signIn');
        console.log('inicial: ', new Date());
        let ret = await this.authRepository.signIn(user);
        console.log('final: ', new Date());
        console.log('-----------------------------');
        return ret;
    }

    async signOut() {
        return await this.authRepository.signOut();
    }

    async removeUser(user: User) {
        return await this.authRepository.removeUser(user);
    }

    async forgotPassword(user: User) {
        return await this.authRepository.forgotPassword(user);
    }

    async verifyPasswordResetCode(code: string) {
        return await this.authRepository.verifyPasswordResetCode(code);
    }

    async confirmPasswordReset(code: string, newPassword: string) {
        return await this.authRepository.confirmPasswordReset(code, newPassword);
    }

    async updateUser(user: User) {
        return await this.authRepository.updateUser(user);
    }

    async currentUser(authorization: string) {
        return await this.authRepository.currentUser(authorization);
    }

    async checkAuthentication(req: NextApiRequest|NextApiRequestWithFormData){
        return await this.authRepository.currentUser(req.headers.authorization);
    }
}

