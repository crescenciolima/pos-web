export class APIRoutes {

    static API_URL = process.env.NEXT_PUBLIC_VERCEL_URL.startsWith("http") ?  process.env.NEXT_PUBLIC_VERCEL_URL : "https://"+ process.env.NEXT_PUBLIC_VERCEL_URL;

    static TEACHER:string = APIRoutes.API_URL + "/api/teacher"

    static COURSE:string = APIRoutes.API_URL + "/api/course"

    static NEWS:string = APIRoutes.API_URL + "/api/news"

    static SUBSCRIPTION:string = APIRoutes.API_URL + "/api/subscription"

    static SELECTIVE_PROCESS:string = APIRoutes.API_URL + "/api/selectiveprocess"
    static SELECTIVE_PROCESS_FILES:string = APIRoutes.API_URL + "/api/selectiveprocessfiles"


}