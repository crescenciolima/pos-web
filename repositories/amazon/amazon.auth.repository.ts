import { AuthError } from "../../models/auth.error";
import { User } from "../../models/user";
import { AuthRepository } from "../auth.repository";
import {  CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails, CognitoUserSession } from 'amazon-cognito-identity-js';
import * as AWS from "aws-sdk/global";
import STS from "aws-sdk/clients/sts";
import { CognitoCallback, CognitoUtil } from "./cognito.service";
import { UserBuilder } from "../../builders/user.builder";
import { AuthErrorBuilder } from "../../builders/auth-error.builder";
import { Repository } from '../repository';
import { Comparator } from "../../utils/comparator";
import { ComparatorEnum } from "../../utils/comparator.enum";

export class AmazonAuthRepository implements AuthRepository{

    public cognitoUtil: CognitoUtil;
    public repository: Repository;
    constructor(repository:Repository){
        this.cognitoUtil = new CognitoUtil();
        this.repository = repository;
    }

    async signUp(user: User): Promise<User | AuthError> {
        let attributeList = [];

        let dataEmail = {
            Name: 'email',
            Value: user.email
        };

        attributeList.push(new CognitoUserAttribute(dataEmail));
        let self = this;
        return new Promise(function (resolve, reject){
            self.cognitoUtil.getUserPool().signUp(user.email, user.password, attributeList, null, function (err, result) {
                if(err){
                    resolve(new AuthErrorBuilder()
                        .message(err.message)
                    .build());    
                }
                else{
                    let register = self.repository.save('user', user);
                    resolve(new UserBuilder()
                        .register(register)
                    .build());
                }
            });        
        });
    }


    async signIn(user: User): Promise<User | AuthError> {

        let authenticationData = {
            Username: user.email,
            Password: user.password,
        };
        let authenticationDetails = new AuthenticationDetails(authenticationData);

        let userData = {
            Username: user.email,
            Pool: this.cognitoUtil.getUserPool()
        };

        let cognitoUser = new CognitoUser(userData);


        let self = this;
        return new Promise(function (resolve, reject){
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: async (result) => {
                    
                    let comparator:Comparator = new Comparator();
                    comparator.add('email', result.getIdToken().payload.email, ComparatorEnum.EQUAL);

                    let listUserRegister: User[] = await self.repository.find('user', comparator);

                    let user = new UserBuilder()
                        .register(listUserRegister[0])
                        .token(result.getAccessToken().getJwtToken())
                    .build();

                    await self.repository.update('user', user);

                    resolve(user);
                },
                onFailure: err => {
                    resolve(new AuthErrorBuilder()
                        .message(err.message)
                    .build());    
                },
            });        
        });
    }
    async signOut(): Promise<boolean | AuthError> {
        this.cognitoUtil.getCurrentUser().signOut();
        return true;
    }
    removeUser(user: User): Promise<boolean | AuthError> {
        throw new Error("Method not implemented.");
    }
    forgotPassword(user: User): Promise<boolean | AuthError> {
        throw new Error("Method not implemented.");
    }
    verifyPasswordResetCode(code: string): Promise<string | AuthError> {
        throw new Error("Method not implemented.");
    }
    confirmPasswordReset(code: string, newPassword: string): Promise<boolean | AuthError> {
        throw new Error("Method not implemented.");
    }
    updateUser(user: User): Promise<boolean | AuthError> {
        throw new Error("Method not implemented.");
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
        let accessToken = await this.cognitoUtil.getAccessToken();
        let payload = accessToken.payload;
        let comparator:Comparator = new Comparator();
        comparator.add('email', payload.email, ComparatorEnum.EQUAL);
        
        let users:User[] = await this.repository.find('user', comparator);

        return new UserBuilder()
            .register(users[0])
            .id(users[0]['_id'])
            .uid(users[0]['_id'])
            .token(token)
        .build();
    }
    
}