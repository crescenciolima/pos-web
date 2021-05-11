import { toast } from 'react-nextjs-toast'
import { APIResponse } from '../models/api-response';

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

            // console.log(result);
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

            const res = await fetch(url, {
                method: 'POST',
                body: body
            });

            const result: APIResponse = await res.json();

            // console.log(result);
            toast.notify(result.msg, {
                duration: 3,
                type: "success",
                title: "Notificação"
            });
            if (setLoading) setLoading(false);
            return result;
        } catch (error) {
            console.error(error);
            if (setLoading) setLoading(false);
        }

    }


    async function get(url: string) {
        try {
            if (setLoading) setLoading(true);

            const res = await fetch(url, {
                method: 'GET',
            });

            const result: APIResponse = await res.json();

            // console.log(result);
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

    return {
        postFile,
        post,
        get,
    }

}
