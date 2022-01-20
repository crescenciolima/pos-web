import { APIResponse } from "../../models/api-response";
import { TreatErrorRepository } from "../treat-error.repository";

export class MongoDbTreatErrorRepository implements TreatErrorRepository{
    message(result: any): APIResponse {
        if(result.message)
            result = result.message;
        
        const response: APIResponse = {
            error: true,
            msg: result,
            result: null
        }
    
        return response;

    }
}