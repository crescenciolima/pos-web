

import FirebaseMessage from "../firebase/firebase-message-util";
import { APIResponse } from "../models/api-response";

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