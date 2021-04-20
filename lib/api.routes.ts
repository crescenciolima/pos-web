export class APIRoutes {

    static API_URL = process.env.VERCEL_URL;

    static DOCENTES:string = APIRoutes.API_URL + "/api/docente"

}