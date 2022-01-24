import { AuthError } from "../../models/auth.error";
import { User } from "../../models/user";
import { Comparator } from "../../utils/comparator";
import { ComparatorEnum } from "../../utils/comparator.enum";
import { AuthRepository } from "../auth.repository";
import { Repository } from "../repository";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserBuilder } from "../../builders/user.builder";
import { AuthErrorBuilder } from "../../builders/auth-error.builder";
import { GenerateFactory } from "../generate.factory";

const KEY = process.env.JWT_KEY;

export class MongoDbAuthRepository implements AuthRepository{

    private mongoDbRepository:Repository;

    constructor(repository:Repository){
        this.mongoDbRepository = repository;
    }

    async signUp(user: User): Promise<User | AuthError> {
        user.password = await bcrypt.hash(user.password, 10);
        return await this.mongoDbRepository.save('user', user);
    }

    async signIn(user: User): Promise<User | AuthError> {
        if(!user.email || !user.password){
            return new AuthErrorBuilder()
                .message("Deve-se informar email e senha")
            .build();
        }

        let comparator:Comparator = new Comparator();
        comparator.add('email', user.email, ComparatorEnum.EQUAL);
        
        let users:User[] = await this.mongoDbRepository.find('user', comparator);
        if(users.length == 0){
            return new AuthErrorBuilder()
                .message("Usuário não existente")
            .build();
        }

        return await bcrypt.compare(user.password, users[0].password).then(async (isMatch) => {
            if (isMatch) {
                const payload = {
                    id: users[0].id,
                    email: users[0].email,
                };

                const token = jwt.sign(payload, KEY,
                    {
                      expiresIn: (5 * 60 * 60),
                    }
                );
                let user = new UserBuilder()
                    .register(users[0])
                    .id(users[0]['_id'])
                    .uid(users[0]['_id'])
                    .token(token)
                .build();
                await this.mongoDbRepository.update('user', user);

                return user;
            }
            else{
                return new AuthErrorBuilder()
                    .message("Usuário não existente")
                .build();
            }
        })
        .catch(async (err) => {
            return new AuthErrorBuilder()
                .message("Usuário não existente")
            .build();
        });

        

    }

    async signOut(): Promise<boolean | AuthError> {
        return true;
    }

    async removeUser(user: User): Promise<boolean | AuthError> {
        await this.mongoDbRepository.remove('user', user.id);
        return true;
    }
    
    async forgotPassword(user: User): Promise<boolean | AuthError> {
        throw new Error("Method not implemented.");
    }

    async verifyPasswordResetCode(code: string): Promise<string | AuthError> {
        throw new Error("Method not implemented.");
    }
    async confirmPasswordReset(code: string, newPassword: string): Promise<boolean | AuthError> {
        throw new Error("Method not implemented.");
    }
    async updateUser(user: User): Promise<boolean | AuthError> {
        await this.mongoDbRepository.update('user', user);
        return true;
    }
    async currentUser(authorization: string): Promise<string | boolean> {
        if (!authorization){
            return false;
        }
    
        try {
            const result = await this.verifyIdToken(authorization);
            return result.uid;
        } catch (err) {
            console.error('Error on verifyIdToken', err);
            return false;
        }
    }
    async verifyIdToken(token: string) {
        let payload = await jwt.verify(token, KEY);
        let comparator:Comparator = new Comparator();
        comparator.add('email', payload.email, ComparatorEnum.EQUAL);
        
        let users:User[] = await this.mongoDbRepository.find('user', comparator);

        return new UserBuilder()
            .register(users[0])
            .id(users[0]['_id'])
            .uid(users[0]['_id'])
            .token(token)
        .build();
    }
    
}