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

    static WORKS:string = APIRoutes.API_URL + "/api/works"

    static SUBSCRIPTION:string = APIRoutes.API_URL + "/api/subscription"
    
    static FILE_BAREMA_SUBSCRIPTION:string = APIRoutes.API_URL + "/api/file-barema-subscription"

    static FILE_SUBSCRIPTION:string = APIRoutes.API_URL + "/api/file-subscription"

    static FILE_FORM_SUBSCRIPTION:string = APIRoutes.API_URL + "/api/file-form-subscription"

    static CURRENT_SUBSCRIPTION:string = APIRoutes.API_URL + "/api/current-subscription"
    
    static RESOURCES:string = APIRoutes.API_URL + "/api/resource"

    static FILE_RESOURCE:string = APIRoutes.API_URL + "/api/file-resource"

    static SELECTIVE_PROCESS:string = APIRoutes.API_URL + "/api/selectiveprocess"

    static SELECTIVE_PROCESS_FILES:string = APIRoutes.API_URL + "/api/selectiveprocessfiles"

    static SELECTIVE_PROCESS_SUBSCRIPTION_GRADING:string = APIRoutes.API_URL + "/api/subscriptiongrading"
    
    static SELECTIVE_PROCESS_SUBSCRIPTION:string = APIRoutes.API_URL + "/api/selectiveprocesssubscription"
    
    static SELECTIVE_PROCESS_RESULTS_SUBMISSION:string = APIRoutes.API_URL + "/api/selectiveprocessresult"

    static VIA_CEP = "https://viacep.com.br/ws/{cep}/json/"

}