import { toast } from 'react-nextjs-toast'
import { APIResponse } from '../models/api-response';
import Cookies from '../lib/cookies.service';
import { GetServerSidePropsContext } from 'next';

export default function API(setLoading?: Function) {

    async function postFile(url: string, body, file) {
        try {
            if (setLoading) setLoading(true);
            let data = new FormData();
            data.append('file', file);
            for (let key in body) {
                data.append(key, body[key]);
            }

            const res = await fetch(url, {
                method: 'POST',
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
        }

    }

    async function post(url: string, body) {
        try {

            if (setLoading) setLoading(true);
            console.log(body);
            const res = await fetch(url, {          
                body: JSON.stringify(body),
                method: 'POST',
            });
            console.log(res);

            const result: APIResponse = await res.json();

            if(result.error){                
                showNotify(result.msg, "error","Erro");                
                if (setLoading) setLoading(false);
                return;
            }
            
            showNotify(result.msg, "success","Notificação");
            if (setLoading) setLoading(false);

            return result;
        } catch (error) {
            console.log(error)
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
            });

            const result: APIResponse = await res.json();

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

    async function showNotify(message, type, title) {
        toast.notify(message, {
            duration: 3,
            type: type,
            title: title
        });
    }

    return {
        postFile,
        post,
        get,
        exclude
    }

}
