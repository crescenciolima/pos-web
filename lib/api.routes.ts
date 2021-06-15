export class APIRoutes {

    static API_URL = process.env.NEXT_PUBLIC_VERCEL_URL.startsWith("http") ?  process.env.NEXT_PUBLIC_VERCEL_URL : "https://"+ process.env.NEXT_PUBLIC_VERCEL_URL;

    static TEACHER:string = APIRoutes.API_URL + "/api/teacher"

    static COURSE:string = APIRoutes.API_URL + "/api/course"

    static NEWS:string = APIRoutes.API_URL + "/api/news"

}