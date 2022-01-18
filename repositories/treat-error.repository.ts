import { APIResponse } from "../models/api-response";

export interface TreatErrorRepository{
    message(result: any):APIResponse;
}