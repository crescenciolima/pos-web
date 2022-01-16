import { BaremaCategory } from "./barema-category";
import { ProcessDocument } from "./process-document";
import { ProcessStep } from "./process-step";
import { ProcessStepsState } from "./process-steps-state.enum";
import { ReservedPlace } from "./reserved-place";

export class SelectiveProcess {
    id?: string;
    title?: string;
    state?: ProcessStepsState;
    creationDate?: number;
    numberPlaces?: number;
    description?: string;
    reservedPlaces?: ReservedPlace[];
    baremaCategories?: BaremaCategory[];
    processForms?: ProcessDocument[];
    processNotices?: ProcessDocument[];
    steps?: ProcessStep[];
    currentStep?: number;
}