

import { GetServerSidePropsContext } from "next";
import { parseCookies, setCookie, destroyCookie } from "nookies";
import Cookies from "./cookies.service";
import { authAdmin } from '../utils/firebase-admin';
import API from "./api.service";
import { APIResponse } from "../models/api-response";
import { APIRoutes } from '../lib/api.routes';
import { User } from "../models/user";
import { UserType } from "../enum/type-user.enum";
import { Message } from "../enum/message.enum";

export default function Permission() {
    const api = API();
    const cookie = Cookies();

    async function checkToken(ctx: GetServerSidePropsContext){
        const token = await cookie.getTokenServer(ctx);
        await authAdmin.verifyIdToken(token);
    }

    async function getCurrentUser(){
        console.log('teste2');
        const response: APIResponse = await api.get(APIRoutes.CURRENT_USER);    
        const user: User =  response.result; 
        return user;
    }

    async function getCurrentUserType(ctx: GetServerSidePropsContext){
        try {
            await checkToken(ctx);

            const user: User = await getCurrentUser();   
        
            return await buildReturn({ userType: user.type as UserType });
        
        } catch (err) {
            return redirectTo("/login");
        }
    }

    async function checkPermissionLogin(ctx: GetServerSidePropsContext) {
        try {
            await checkToken(ctx);

            console.log('teste');

            const user: User =  await getCurrentUser();   
            let redirect =  '';
            
            if(user.type === UserType.STUDENT){
              redirect = "/selective-process";
            }else if ([UserType.MASTER, UserType.ADMIN].includes(user.type as UserType)){            
              redirect = "/admin";
            }
              
            return redirectTo(redirect);
      
          } catch (err) {
            return {
              props: {} as never
            };
          }
    }

    async function checkPermission(ctx: GetServerSidePropsContext, typesAllowed: String[]) {
        try {
            await checkToken(ctx);

            const user: User =  await getCurrentUser();   
        
            console.log(user);

            if(typesAllowed.includes(user.type as UserType)){
                return await buildReturnMessage(Message.AUTHORIZED);
            }
        
            return redirectTo("/error/not-authorized");
        
        } catch (err) {
            return redirectTo("/login");
        }
    }

    async function redirectTo(destination: string){
        return {
            redirect: {
                permanent: false,
                destination: destination,
            },
            props: {} as never,
          };
    }

    async function buildReturnMessage(message: string){
        return buildReturn({ message: message });
    }

    async function buildReturn(object: Object){
        return {
            props: object,
        };
    }

    return {
        checkPermissionLogin,
        checkPermission,
        getCurrentUserType,
    }
}