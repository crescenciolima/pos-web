import { ProcessStepsTypes } from "./process-steps-types.enum";

export class ProcessStep {
    order: number;
    startDate: number;
    finishDate: number;
    weight: number;
    passingScore: number;
    type: ProcessStepsTypes;
    resultURL?:string;
}
