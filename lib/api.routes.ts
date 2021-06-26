export class APIRoutes {

    static API_URL = process.env.NEXT_PUBLIC_VERCEL_URL.startsWith("http") ?  process.env.NEXT_PUBLIC_VERCEL_URL : "https://"+ process.env.NEXT_PUBLIC_VERCEL_URL;

    static TEACHER:string = APIRoutes.API_URL + "/api/teacher"

    static COURSE:string = APIRoutes.API_URL + "/api/course"

    static SIGNIN:string = APIRoutes.API_URL + "/api/auth/signin"

    static SIGNUP:string = APIRoutes.API_URL + "/api/auth/signup"
    
    static SIGNOUT:string = APIRoutes.API_URL + "/api/auth/signout"

    static USER:string = APIRoutes.API_URL + "/api/user"
}