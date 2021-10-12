import { ProcessStep, ProcessStepsState, ProcessStepsTypes, SelectiveProcess } from "../models/selective-process";
import { Subscription, SubscriptionResource, SubscriptionStatus } from "../models/subscription";
import SelectiveProcessUtil from './selectiveprocess.util';
import { ResourceStepsHelper } from '../helpers/resource-steps-helper';


export default function ResourceUtil() {
    const processUtil = SelectiveProcessUtil();
    const resourceSteps = ResourceStepsHelper.steps();

    const stepTypeAllowResource = (type) => {
        return resourceSteps.includes(type);
    }

    const resultAllowResource = (stepType, subscription: Subscription, selectiveProcess: SelectiveProcess) => {
        switch (stepType) {
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
        console.log(subscription, currentStep, selectiveProcess);
        let resourceFound: SubscriptionResource = subscription.resources.find((resource) => currentStep.type === resource.step);
        console.log(stepTypeAllowResource(currentStep.type), resourceFound, resultAllowResource(currentStep.type, subscription, selectiveProcess));
        
        if(!stepTypeAllowResource(currentStep.type) || resourceFound || !resultAllowResource(currentStep.type, subscription, selectiveProcess)) {
           return false;
        }

        return true;
    }

    function currentStepIdGranThanFirstResourceStep(selectiveProcess: SelectiveProcess): boolean {
        const currentStep: ProcessStep = processUtil.getCurrentStep(selectiveProcess);
        const firstResourceStep = processUtil.getStepByType(selectiveProcess, ProcessStepsTypes.INTERPOSICAO_RECURSO_INSCRICAO);

        return currentStep.order >= firstResourceStep.order;
    }

    return {
        canRequestResource,
        stepTypeAllowResource,
        currentStepIdGranThanFirstResourceStep
    }

}

