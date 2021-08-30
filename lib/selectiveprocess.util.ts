import { ProcessStep, ProcessStepsState, ProcessStepsTypes, SelectiveProcess } from "../models/selective-process";
import { Subscription, SubscriptionStatus } from "../models/subscription";


export default function SelectiveProcessUtil() {


    function getCurrentStep(process: SelectiveProcess): ProcessStep {

        // const currentDate = (new Date()).setHours(0, 0, 0, 0);
        // for (let step of process.steps) {
        //     const startDate = new Date(step.startDate);
        //     const finishDate = new Date(step.finishDate);
        //     if (startDate.setHours(0, 0, 0, 0) <= currentDate && finishDate.setHours(23, 59, 59, 999) > currentDate) {
        //         return step;
        //     }
        // }

        const currentStep = process.steps.find(step => step.order == process.currentStep);
        return currentStep;
    }

    function calculateFinalGrade(subscription: Subscription, process: SelectiveProcess): number {

        let finalGrade = 0;

            for (let step of process.steps) {
                if (step.type == ProcessStepsTypes.ENTREVISTA) {
                    if (subscription.interviewGrade >= step.passingScore) {
                        finalGrade += (subscription.interviewGrade * step.weight);
                    }
                }
                if (step.type == ProcessStepsTypes.PROVA) {
                    if (subscription.testGrade >= step.passingScore) {
                        finalGrade += (subscription.testGrade * step.weight);
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

