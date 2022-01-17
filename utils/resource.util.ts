import SelectiveProcessUtil from '../lib/selectiveprocess.util';
import { ResourceStepsHelper } from '../helpers/resource-steps-helper';
import { Subscription } from '../models/subscription/subscription';
import { SelectiveProcess } from '../models/subscription-process/selective-process';
import { ProcessStepsTypes } from '../models/subscription-process/process-steps-types.enum';
import { SubscriptionStatus } from '../models/subscription/subscription-resource.enum';
import { ProcessStep } from '../models/subscription-process/process-step';
import { SubscriptionResource } from '../models/subscription/subscription-resource';


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
                return true;
            case ProcessStepsTypes.INTERPOSICAO_RECURSO_ENTREVISTA:
                return !processUtil.hasPassedInterview(subscription, selectiveProcess.steps.find((step) => step.type === ProcessStepsTypes.ENTREVISTA));
            case ProcessStepsTypes.INTERPOSICAO_RECURSO_AVALIACAO_CURRICULAR:
                return processUtil.hasFileRejected(subscription);
            default:
                return false;
        }
    }

    function canRequestResource(subscription: Subscription, selectiveProcess: SelectiveProcess): boolean {                      
        const currentStep: ProcessStep = processUtil.getCurrentStep(selectiveProcess);
        let resourceFound: SubscriptionResource = subscription.resources.find((resource) => currentStep.type === resource.step);
        
        if(!stepTypeAllowResource(currentStep.type) || resourceFound || !resultAllowResource(currentStep.type, subscription, selectiveProcess)) {
           return false;
        }

        return true;
    }

    function currentStepIdGranThanFirstResourceStep(selectiveProcess: SelectiveProcess): boolean {
        const currentStep: ProcessStep = processUtil.getCurrentStep(selectiveProcess);
        const firstResourceStep = processUtil.getStepByType(selectiveProcess, ProcessStepsTypes.INTERPOSICAO_RECURSO_INSCRICAO);

        return firstResourceStep == undefined || currentStep.order >= firstResourceStep.order;
    }

    return {
        canRequestResource,
        stepTypeAllowResource,
        currentStepIdGranThanFirstResourceStep
    }

}

