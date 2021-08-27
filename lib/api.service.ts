import { toast } from 'react-nextjs-toast'
import { APIResponse } from '../models/api-response';
import Cookies from '../lib/cookies.service';
import { GetServerSidePropsContext } from 'next';

export default function API(setLoading?: Function) {
    const cookies = Cookies();

    async function postFile(url: string, body, file) {
        try {
            if (setLoading) setLoading(true);

            let data = new FormData();
            
            if(file.length){
                for (let i = 0; i < file.length; i++){
                    data.append('file', file[i]);
                }
            }else{
                data.append('file', file);
            }

            for (let key in body) {
                data.append(key, body[key]);
            }

            const res = await fetch(url, {
                method: 'POST',
                body: data,
                headers: await buildHeadersFormData(),
            });

            const result: APIResponse = await res.json();

            toast.notify(result.msg, {
                duration: 3,
                type: "success",
                title: "Notificação"
            });
            if (setLoading) setLoading(false);
            return result;

        } catch (error) {
            console.error(error);
        }

    }

    async function post(url: string, body) {
        try {

            if (setLoading) setLoading(true);
            (body);
            const res = await fetch(url, {          
                body: JSON.stringify(body),
                headers: await buildHeaders(),
                method: 'POST',
            });

            const result: APIResponse = await res.json();

            if(result.error){                
                showNotify(result.msg, "error","Erro");                
                if (setLoading) setLoading(false);
                return;
            }
            
            if (setLoading) setLoading(false);
            
            showNotify(result.msg, "success","Notificação");

            return result;
        } catch (error) {
            (error)
            showNotify(error.msg, "error","Erro");

            if (setLoading) setLoading(false);

            return;
        }

    }

    async function get(url: string, params?) {
        try {     
            if (setLoading) setLoading(true);

            if (params) {
                let urlBuilder = new URL(url);
                urlBuilder.search = new URLSearchParams(params).toString();
                url = urlBuilder.toString();
            }

            const res = await fetch(url, {
                method: 'GET',
                headers: await buildHeaders(),
            });

            const result: APIResponse = await res.json();

            if(result.error){                              
                if (setLoading) setLoading(false);
                return null;
            }

            if (setLoading) setLoading(false);
            return result;

        } catch (error) {
            console.error(error);
            toast.notify("Ocorreu um erro ao buscar os dados", {
                duration: 3,
                type: "error",
                title: "Erro"
            });
            if (setLoading) setLoading(false);

        }

    }

    async function getWithContext(ctx: GetServerSidePropsContext, url: string, params?) {
        try {     
            if (setLoading) setLoading(true);

            if (params) {
                let urlBuilder = new URL(url);
                urlBuilder.search = new URLSearchParams(params).toString();
                url = urlBuilder.toString();
            }

            const res = await fetch(url, {
                method: 'GET',
                headers: await buildHeadersWithContext(ctx),
            });

            const result: APIResponse = await res.json();

            if(result.error){                              
                if (setLoading) setLoading(false);
                return false;
            }

            if (setLoading) setLoading(false);
            return result;

        } catch (error) {
            console.error(error);
            toast.notify("Ocorreu um erro ao buscar os dados", {
                duration: 3,
                type: "error",
                title: "Erro"
            });
            if (setLoading) setLoading(false);

        }

    }


    async function exclude(url: string, params?) {
        try {           

            if (setLoading) setLoading(true);

            if (params) {
                let urlBuilder = new URL(url);
                urlBuilder.search = new URLSearchParams(params).toString();
                url = urlBuilder.toString();
            }

            const res = await fetch(url, {
                method: 'DELETE',
            });

            const result: APIResponse = await res.json();

            toast.notify(result.msg, {
                duration: 3,
                type: "success",
                title: "Notificação"
            });
            if (setLoading) setLoading(false);
            return result;

        } catch (error) {
            console.error(error);

            toast.notify("Ocorreu um erro ao buscar os dados", {
                duration: 3,
                type: "error",
                title: "Erro"
            });

            if (setLoading) setLoading(false);
        }
    }


    async function excludeFormData(url: string, body?) {
        try {
            if (setLoading) setLoading(true);

            let data = new FormData();
            for (let key in body) {
                if(typeof body[key] == "object"){
                    data.append(key, JSON.stringify(body[key]));
                }else{
                    data.append(key, body[key]);
                }
            }

            // if (params) {
            //     let urlBuilder = new URL(url);
            //     urlBuilder.search = new URLSearchParams(params).toString();
            //     url = urlBuilder.toString();
            // }

            const res = await fetch(url, {
                method: 'DELETE',
                body: data
            });

            const result: APIResponse = await res.json();

            toast.notify(result.msg, {
                duration: 3,
                type: "success",
                title: "Notificação"
            });
            if (setLoading) setLoading(false);
            return result;

        } catch (error) {
            console.error(error);
            toast.notify("Ocorreu um erro ao buscar os dados", {
                duration: 3,
                type: "error",
                title: "Erro"
            });
            if (setLoading) setLoading(false);

        }
    }

    async function showNotify(message, type, title) {
        toast.notify(message, {
            duration: 3,
            type: type,
            title: title
        });
    }

    async function buildHeaders(){
        const token = await cookies.getTokenClient();
        return {
            'Content-Type': 'application/json',
            'Authorization': token,
        };
    }

    async function buildHeadersFormData(){
        const token = await cookies.getTokenClient();
        return {
            'Authorization': token,
        };
    }

    async function buildHeadersWithContext(ctx: GetServerSidePropsContext){
        const token = await cookies.getTokenServer(ctx);
        return {
            'Content-Type': 'application/json',
            'Authorization': token,
        };
    }

    return {
        postFile,
        post,
        get,
        exclude,
        excludeFormData,
        getWithContext,
    }

}
