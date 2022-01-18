import FirebaseMessage from "../../firebase/firebase-message-util";
import { APIResponse } from "../../models/api-response";
import { TreatErrorRepository } from "../treat-error.repository";

export class FirebaseTreatErrorRepository implements TreatErrorRepository{
    message(result: any): APIResponse {
        if(result.message)
            return this.firebase(result);
        else
            return this.general(result);
    }

    private firebase(result: any){    
        const defaultMessage = 'Erro no Firebase.';
        const translatedMessage = FirebaseMessage()[result.message];
  
        const response: APIResponse = {
          error: true,
          msg: translatedMessage ? translatedMessage : defaultMessage,
          result: null
        }
  
        return response;
    }
  
    private general(message: any){    
        const defaultMessage = 'Ocorreu um erro ao efetuar ação.';

        const response: APIResponse = {
        error: true,
        msg: message ? message : defaultMessage,
        result: null
        }

        return response;
    }
}