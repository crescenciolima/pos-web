import { GetServerSidePropsContext } from "next";
import Cookies from "./cookies.service";
import API from "./api.service";
import { APIResponse } from "../models/api-response";
import { User } from "../models/user";
import { UserType } from "../enum/type-user.enum";
import { Message } from "../enum/message.enum";
import { APIRoutes } from "../utils/api.routes";
import { AuthRepository } from "../repositories/auth.repository";
import { GenerateFactory } from "../repositories/generate.factory";

export default function Permission() {
    const api = API();
    const cookie = Cookies();
    const authRepository:AuthRepository = GenerateFactory.getInstance().authRepository();

    async function checkToken(ctx: GetServerSidePropsContext){
        const token = await cookie.getTokenServer(ctx);
        await authRepository.verifyIdToken(token);
    }

    async function getCurrentUser(ctx: GetServerSidePropsContext){
        const response = await api.getWithContext(ctx, APIRoutes.CURRENT_USER);  
        if(!response){
            throw new Error();
        }  
        const user: User = (response as APIResponse).result; 
        return user;
    }

    async function getCurrentUserType(ctx: GetServerSidePropsContext){
        try {
            await checkToken(ctx);

            const user: User = await getCurrentUser(ctx);   
        
            return await buildReturn({ userType: user.type as UserType });
        
        } catch (err) {
            return redirectTo("/login");
        }
    }

    async function checkPermissionLogin(ctx: GetServerSidePropsContext) {
        try {
            await checkToken(ctx);

            const user: User =  await getCurrentUser(ctx);   
            let redirect =  '';
            
            if(user.type === UserType.STUDENT){
              redirect = "/student";
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
            const user: User =  await getCurrentUser(ctx);   

            if(typesAllowed.includes(user.type as UserType)){
                return await buildReturnMessage(Message.AUTHORIZED);
            }
        
            return redirectTo("/error/not-authorized");        
        } catch (err) {
            console.log('err = ', err)
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