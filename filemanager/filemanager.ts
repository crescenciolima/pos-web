import axios from "axios";
import { Arquivo } from "./entities/arquivo";

export class Filemanager{

    FILE_MANAGER_URL = process.env.FILE_MANAGER_URL;
    FILE_MANAGER_KEY = process.env.FILE_MANAGER_KEY;

    axiosConfig = { headers: {
        common: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    }} ;

    async insertArquivo(arquivo:Arquivo):Promise<Arquivo>{
        return await axios.post<any>(`${this.FILE_MANAGER_URL}/arquivos?key=${this.FILE_MANAGER_KEY}`, arquivo, {
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                "Content-Type": "application/json",
                Accept: "application/json"
            }
        }).then(value => arquivo = value.data);
    }

    async deleteArquivo(url:string):Promise<Arquivo>{
        return await axios.delete<any>(url, {
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                "Content-Type": "application/json",
                Accept: "application/json",
                "Authorization": `${this.FILE_MANAGER_KEY}`
            }
        }).then(value => value.data);
    }

}