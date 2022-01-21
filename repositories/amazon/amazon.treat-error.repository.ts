import AmazonMessage from "../../amazon/amazon-message-util";
import { APIResponse } from "../../models/api-response";
import { TreatErrorRepository } from "../treat-error.repository";

export class AmazonTreatErrorRepository implements TreatErrorRepository{
    message(result: any): APIResponse {
        if(result.message)
            return this.amazon(result);
        else
            return this.general(result);
    }

    private amazon(result: any){    
        const defaultMessage = result.message;
        const translatedMessage = AmazonMessage()[result.message];
  
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