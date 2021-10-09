import { ProcessStep, ProcessStepsState, ProcessStepsTypes, SelectiveProcess } from "../models/selective-process";
import { Subscription, SubscriptionResource, SubscriptionStatus } from "../models/subscription";
import SelectiveProcessUtil from './selectiveprocess.util';
import { ResourceStepsHelper } from '../helpers/resource-steps-helper';


export default function ResourceUtil() {
    const processUtil = SelectiveProcessUtil();
    const resourceSteps = ResourceStepsHelper.steps();

    const resultAllowResource = (step, subscription: Subscription, selectiveProcess: SelectiveProcess) => {
        switch (step) {
            case ProcessStepsTypes.INTERPOSICAO_RECURSO_INSCRICAO:
                return subscription.status === SubscriptionStatus.INDEFERIDA;
            case ProcessStepsTypes.INTERPOSICAO_RECURSO_PROVA:
                return !processUtil.hasPassedTest(subscription, selectiveProcess.steps.find((step) => step.type === ProcessStepsTypes.PROVA));
            case ProcessStepsTypes.INTERPOSICAO_RECURSO_ENTREVISTA:
                return !processUtil.hasPassedTest(subscription, selectiveProcess.steps.find((step) => step.type === ProcessStepsTypes.ENTREVISTA));
            case ProcessStepsTypes.INTERPOSICAO_RECURSO_AVALIACAO_CURRICULAR:
                return !processUtil.isSubscriberApproved(subscription, selectiveProcess);
            default:
                return false;
        }
    }

    function canRequestResource(subscription: Subscription, selectiveProcess: SelectiveProcess): boolean {                      
        const currentStep: ProcessStep = processUtil.getCurrentStep(selectiveProcess);
        console.log(currentStep);
        let resourceFound: SubscriptionResource = subscription.resources.find((resource) => currentStep.type === resource.step);
        console.log(resourceFound);
        
        if(!resourceSteps.includes(currentStep.type) || resourceFound || !resultAllowResource(currentStep, subscription, selectiveProcess)) {
           return false;
        }

        return true;
    }

    return {
        canRequestResource
    }

}

