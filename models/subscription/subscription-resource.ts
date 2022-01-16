import { ProcessStepsTypes } from "../subscription-process/process-steps-types.enum";
import { SubscriptionStatus } from "./subscription-resource.enum";

export class SubscriptionResource {
    id?: string;
    justification: string;
    date: string|Date;
    step: ProcessStepsTypes;
    status: SubscriptionStatus;
    statusObservation?: string;
    files?: string[];
    
    //Only for UI
    formatedDate?: string;
}