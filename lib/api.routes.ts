export class APIRoutes {

    static API_URL = process.env.NEXT_PUBLIC_VERCEL_URL.startsWith("http") ?  process.env.NEXT_PUBLIC_VERCEL_URL : "https://"+ process.env.NEXT_PUBLIC_VERCEL_URL;

    static TEACHER:string = APIRoutes.API_URL + "/api/teacher"

    static COURSE:string = APIRoutes.API_URL + "/api/course"

    static SIGNIN:string = APIRoutes.API_URL + "/api/auth/signin"

    static SIGNUP:string = APIRoutes.API_URL + "/api/auth/signup"
    
    static SIGNOUT:string = APIRoutes.API_URL + "/api/auth/signout"

    static FORGOT_PASSWORD:string = APIRoutes.API_URL + "/api/auth/forgot-password"

    static VERIFY_CODE:string = APIRoutes.API_URL + "/api/auth/verify-code"

    static RESET_PASSWORD:string = APIRoutes.API_URL + "/api/auth/reset-password"

    static CURRENT_USER:string = APIRoutes.API_URL + "/api/auth/user"

    static USER:string = APIRoutes.API_URL + "/api/user"

    static USER_PROFILE:string = APIRoutes.API_URL + "/api/user-profile"

    static NEWS:string = APIRoutes.API_URL + "/api/news"

    static SELECTIVE_PROCESS:string = APIRoutes.API_URL + "/api/selectiveprocess"

    static SELECTIVE_PROCESS_FILES:string = APIRoutes.API_URL + "/api/selectiveprocessfiles"

    static SUBSCRIPTION:string = APIRoutes.API_URL + "/api/subscription"

}