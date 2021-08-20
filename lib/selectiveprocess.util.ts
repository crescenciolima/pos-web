import { ProcessStep, ProcessStepsState, SelectiveProcess } from "../models/selective-process";
import { Subscription } from "../models/subscription";


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

    function calculateFinalGrade(subscription: Subscription, process: SelectiveProcess): number {

        let finalGrade = 0;

        for (let grade of subscription.grades) {
            for (let step of process.steps) {
                if (grade.step == step.type) {

                    if (grade.grade >= step.passingScore) {
                        finalGrade += (grade.grade * step.weight);
                    }

                }
            }

        }
        return finalGrade;
    }

    function orderSubscriptionList(subscriptionList: Subscription[], process:SelectiveProcess) :  Subscription[]{
        //levar em consideração idade e anos de experiência e vagas reservadas
        for(let sub of subscriptionList){
            sub['finalGrade'] = calculateFinalGrade(sub, process);
        }
        
        subscriptionList.sort((a, b) => b['finalGrade'] - a['finalGrade']);

        return subscriptionList;
    }

    return {
        getCurrentStep,
        calculateFinalGrade,
        orderSubscriptionList
    }

}

