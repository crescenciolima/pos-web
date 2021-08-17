

import { GetServerSidePropsContext } from "next";
import { parseCookies, setCookie, destroyCookie } from "nookies";
import Cookies from "./cookies.service";
import { authAdmin } from '../utils/firebase-admin';
import API from "./api.service";
import { APIResponse } from "../models/api-response";
import { APIRoutes } from './api.routes';
import { User } from "../models/user";
import { UserType } from "../enum/type-user.enum";
import { Message } from "../enum/message.enum";
import FirebaseMessage from "../utils/firebase-message-util";

export default function TreatError() {

    async function firebase(result: any){    
      const defaultMessage = 'Erro no Firebase.';
      const translatedMessage = FirebaseMessage()[result.message];

      const response: APIResponse = {
        error: true,
        msg: translatedMessage ? translatedMessage : defaultMessage,
        result: null
      }

      return response;
    }

    async function general(message: any){    
        const defaultMessage = 'Ocorreu um erro ao efetuar ação.';
  
        const response: APIResponse = {
          error: true,
          msg: message ? message : defaultMessage,
          result: null
        }
  
        return response;
    }

    return {
        firebase,
        general, 
    }
}