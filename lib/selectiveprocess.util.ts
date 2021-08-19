import { ProcessStep, ProcessStepsState, SelectiveProcess } from "../models/selective-process";


export default function SelectiveProcessUtil() {

  
    function getCurrentStep(process: SelectiveProcess): ProcessStep {

        const currentDate = (new Date()).setHours(0, 0, 0, 0);
        for (let step of process.steps) {
            const startDate = new Date(step.startDate);
            const finishDate = new Date(step.finishDate);
            if (startDate.setHours(0, 0, 0, 0) <= currentDate && finishDate.setHours(23, 59, 59, 999) > currentDate) {
                return step;
            }
        }

        return null;
    }

    return {
        getCurrentStep
    }

}

