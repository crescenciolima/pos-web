

import { GetServerSidePropsContext } from "next";
import { parseCookies, setCookie, destroyCookie } from "nookies";

export default function Cookies() {

    async function setUserName(userName: string) {
        set(process.env.NEXT_PUBLIC_USER_NAME, userName);
    }

    async function setUserType(type: string) {
        set(process.env.NEXT_PUBLIC_USER_TYPE, type);
    }

    async function setToken(token: string) {
        set(process.env.NEXT_PUBLIC_TOKEN, token);
    }

    async function set(name: string, value: string) {
        destroyCookie(null, name);
        setCookie(null, name, value, {path: '/'}); 
    }

    async function getTokenClient() {
        const cookies = await getClient();
        return cookies[process.env.NEXT_PUBLIC_TOKEN];
    }

    async function getUserNameClient() {
        const cookies = await getClient();
        return cookies[process.env.NEXT_PUBLIC_USER_NAME];
    }

    async function getUserTypeClient() {
        const cookies = await getClient();
        return cookies[process.env.NEXT_PUBLIC_USER_TYPE];
    }

    async function getClient() {  
        return parseCookies();
    }

    async function getTokenServer(ctx: GetServerSidePropsContext) {
        const cookies = await getServer(ctx);
        return cookies[process.env.NEXT_PUBLIC_TOKEN];
    }

    async function getServer(ctx: GetServerSidePropsContext) {  
        return parseCookies(ctx);
    }

    async function removeToken() {  
        destroyCookie(null, process.env.NEXT_PUBLIC_TOKEN);
    }

    async function removeAll() {  
        destroyCookie(null, process.env.NEXT_PUBLIC_TOKEN);
        destroyCookie(null, process.env.NEXT_PUBLIC_USER_NAME);
        destroyCookie(null, process.env.NEXT_PUBLIC_USER_TYPE);
    }

    return {
        setToken,
        setUserName,
        setUserType,
        getTokenClient,
        getTokenServer,
        getUserNameClient,
        getUserTypeClient,
        removeToken,
        removeAll,
    }
}