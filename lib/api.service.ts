import { toast } from 'react-nextjs-toast'
import { APIResponse } from '../models/api-response';
import Cookies from '../lib/cookies.service';
import { GetServerSidePropsContext } from 'next';
import { APIRoutes } from '../utils/api.routes';

export default function API(setLoading?: Function) {
    const cookies = Cookies();

    async function postFile(url: string, body, file) {
        try {
            if (setLoading) setLoading(true);

            let data = new FormData();
            if (file) {
                if (file.length) {
                    for (let i = 0; i < file.length; i++) {
                        data.append('file', file[i]);
                    }
                } else {
                    data.append('file', file);
                }
            }


            for (let key in body) {
                const content = body[key]
                let keyName = key
                if(Array.isArray(content)){
                    keyName = `${key}[]`
                    for (let _key in content) {
                        data.append(keyName, content[_key]);
                    }
                }else{
                    data.append(keyName,content);
                }
            }

            const res = await fetch(url, {
                method: 'POST',
                body: data,
                headers: await buildHeadersFormData(),
            });

            await treatResponse(res);

            const result: APIResponse = await res.json();

            if (result.error) {
                showNotify(result.msg, "error", "Erro");
                if (setLoading) setLoading(false);
                return;
            }

            if (setLoading) setLoading(false);

            showNotify(result.msg, "success", "Notificação");

            return result;
        } catch (error) {
            console.error(error);
            showNotify(error.msg, "error", "Erro");
            if (setLoading) setLoading(false);
            return;
        }

    }

    async function post(url: string, body) {
        try {

            if (setLoading) setLoading(true);

            const res = await fetch(url, {
                body: JSON.stringify(body),
                headers: await buildHeaders(),
                method: 'POST',
            });

            await treatResponse(res);

            const result: APIResponse = await res.json();
            
            if (result.error) {
                showNotify(result.msg, "error", "Erro");
                if (setLoading) setLoading(false);
                return;
            }

            if (setLoading) setLoading(false);

            showNotify(result.msg, "success", "Notificação");

            return result;
        } catch (error) {
            console.error(error);
            showNotify(error.msg, "error", "Erro");
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

            await treatResponse(res);

            const result: APIResponse = await res.json();
            if (result.error) {
                showNotify(result.msg, "error", "Erro");
                if (setLoading) setLoading(false);
                return null;
            }

            if (setLoading) setLoading(false);
            return result;

        } catch (error) {
            console.error(error);
            showNotify(error.msg, "error", "Erro");
            if (setLoading) setLoading(false);
            return;
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

            if (result.error) {
                showNotify(result.msg, "error", "Erro");
                if (setLoading) setLoading(false);
                return;
            }

            if (setLoading) setLoading(false);
            return result;

        } catch (error) {
            console.error(error);
            showNotify(error.msg, "error", "Erro");
            if (setLoading) setLoading(false);
            return;
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
                headers: await buildHeaders(),
            });

            await treatResponse(res);

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
                if (typeof body[key] == "object") {
                    data.append(key, JSON.stringify(body[key]));
                } else {
                    data.append(key, body[key]);
                }
            }

            const res = await fetch(url, {
                method: 'DELETE',
                body: data
            });

            await treatResponse(res);

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

    async function showNotify(message, type, title, duration = 3) {
        toast.notify(message, {
            duration: duration,
            type: type,
            title: title,
        });
    }

    async function buildHeaders() {
        const token = await cookies.getTokenClient();
        return {
            'Content-Type': 'application/json',
            'Authorization': token,
        };
    }

    async function buildHeadersFormData() {
        const token = await cookies.getTokenClient();
        return {
            'Authorization': token,
        };
    }

    async function buildHeadersWithContext(ctx: GetServerSidePropsContext) {
        const token = await cookies.getTokenServer(ctx);
        return {
            'Content-Type': 'application/json',
            'Authorization': token,
        };
    }

    async function treatResponse(response: Response) {
        if(response.status === 401) {
            await cookies.removeToken()
            window.location.href = '/login'
        }
    }

    async function getViaCep(postalCode) {
        try {
            if (setLoading) setLoading(true);

            const url = (APIRoutes.VIA_CEP).replace('{cep}', postalCode);

            const res = await fetch(url, {
                method: 'GET',
            });

            const result = await res.json();
            
            return result;

        } catch (error) {
            console.error(error);
            console.log(error);
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
        exclude,
        excludeFormData,
        getWithContext,
        getViaCep,
        showNotify
    }

}
