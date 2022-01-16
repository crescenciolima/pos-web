import { ProcessStep } from "../models/subscription-process/process-step";
import { ProcessStepsTypes } from "../models/subscription-process/process-steps-types.enum";
import { SelectiveProcess } from "../models/subscription-process/selective-process";
import { Subscription } from "../models/subscription/subscription";
import { SubscriptionStatus } from "../models/subscription/subscription-resource.enum";
import API from "./api.service";


export default function SelectiveProcessUtil() {


    function getCurrentStep(process: SelectiveProcess): ProcessStep {
        const currentStep = process.steps.find(step => step.order == process.currentStep);
        return currentStep;
    }

    function getStepByType(process: SelectiveProcess, type): ProcessStep {
        return process.steps.find(step => step.type === type);
    }

    function setSubscriptionPlaceName(sub: Subscription, process: SelectiveProcess): void {
        sub.placeName = process?.reservedPlaces.find(place => place.uuid == sub.reservedPlace)?.name || "Ampla Concorrência";
    }

    function hasPassedTest(sub: Subscription, step: ProcessStep): boolean {
        return sub.testGrade != undefined && sub.testGrade >= step.passingScore;
    }

    function hasPassedInterview(sub: Subscription, step: ProcessStep): boolean {
        return sub.interviewGrade != undefined && sub.interviewGrade >= step.passingScore;
    }

    function calculateTestsGrade(subscription: Subscription, process: SelectiveProcess): number {

        let testGrade = 0;

        for (let step of process.steps) {
            if (step.type == ProcessStepsTypes.ENTREVISTA) {
                if (subscription.interviewGrade >= step.passingScore) {
                    testGrade += (subscription.interviewGrade * step.weight);
                }
            }
            if (step.type == ProcessStepsTypes.PROVA) {
                if (subscription.testGrade >= step.passingScore) {
                    testGrade += (subscription.testGrade * step.weight);
                }
            }
        }
        return testGrade;
    }

    function calculateBaremaGrade(subscription: Subscription, process: SelectiveProcess): number {
        let baremaStep = process.steps.find(step => step.type == ProcessStepsTypes.AVALIACAO_CURRICULAR);

        let baremaPoints = 0;
        if (baremaStep) {
            if (subscription.files) {
                for (let baremaCat of process.baremaCategories) {
                    let pointsInCategory: number = 0;
                    for (let subCat of baremaCat.subcategories) {
                        let filesGroup = subscription.files.filter(file => file.subcategoryID == subCat.uuid);
                        for (let group of filesGroup) {
                            for (let file of group.files) {
                                if (file.status == SubscriptionStatus.DEFERIDA) {
                                    pointsInCategory = pointsInCategory + +subCat.points;
                                }
                            }
                        }
                    }
                    baremaPoints = baremaPoints + (pointsInCategory > baremaCat.maxPoints ? baremaCat.maxPoints : pointsInCategory);
                }
            }
        }

        return baremaPoints;
    }

    function calculateFinalGrade(subscription: Subscription, process: SelectiveProcess): number {

        let testStep = process.steps.find(step => step.type == ProcessStepsTypes.PROVA);
        let interviewStep = process.steps.find(step => step.type == ProcessStepsTypes.ENTREVISTA);
        let baremaStep = process.steps.find(step => step.type == ProcessStepsTypes.AVALIACAO_CURRICULAR);

        let totalWeight = (testStep ? testStep.weight : 0) + (interviewStep ? interviewStep.weight : 0) + (baremaStep ? baremaStep.weight : 0);

        let finalGrade = ((testStep ? (testStep.weight * subscription.testGrade) : 0) + (interviewStep ? (interviewStep.weight * subscription.interviewGrade) : 0) + (baremaStep ? (baremaStep.weight * calculateBaremaGrade(subscription, process)) : 0)) / (totalWeight == 0 ? 1 : totalWeight);

        return finalGrade;
    }

    function orderSubscriptionListByTests(subscriptionList: Subscription[], process: SelectiveProcess): Subscription[] {
        //levar em consideração idade e anos de experiência e vagas reservadas
        for (let sub of subscriptionList) {
            sub['finalGrade'] = calculateTestsGrade(sub, process);
        }

        subscriptionList.sort((a, b) => b['finalGrade'] - a['finalGrade']);

        return subscriptionList;
    }

    function isSubscriberApproved(sub: Subscription, process: SelectiveProcess, ignoreBaremaScore = false): boolean {
        let aproved = true;
        let testStep = process.steps.find(step => step.type == ProcessStepsTypes.PROVA);
        let interviewStep = process.steps.find(step => step.type == ProcessStepsTypes.ENTREVISTA);
        let baremaStep = process.steps.find(step => step.type == ProcessStepsTypes.AVALIACAO_CURRICULAR);

        if (testStep) {
            if (testStep.passingScore > sub.testGrade) {
                aproved = false;
            }
        }

        if (interviewStep) {
            if (interviewStep.passingScore > sub.interviewGrade) {
                aproved = false;
            }
        }

        if (baremaStep && !ignoreBaremaScore) {
            if (baremaStep.passingScore > calculateBaremaGrade(sub, process)) {
                aproved = false;
            }
        }
        return aproved;
    }

    function hasFileRejected(sub: Subscription) {
        const filesRejected = sub.files.find((subscriptionFileCategory) =>
            subscriptionFileCategory.files.find(file => file.status === SubscriptionStatus.INDEFERIDA)
        )
        return filesRejected;
    }

    function isCurrentStepValid(process: SelectiveProcess, subscriptionList: Subscription[],ignoreResults = false): boolean {
        let currentStep = getCurrentStep(process);
        const api = API();

        switch (currentStep.type) {
            case ProcessStepsTypes.HOMOLOGACAO_PRELIMINAR_INSCRICAO:

                for (let sub of subscriptionList) {
                    if (sub.status == SubscriptionStatus.AGUARDANDO_ANALISE) {
                        api.showNotify("Ainda existem inscrições aguardando análise", "error", "Atenção", 4);
                        return false;
                    }
                }

                if (!currentStep.resultURL && !ignoreResults) {
                    api.showNotify("Divulge os resultados antes de avançar", "error", "Atenção", 4);
                    return false;
                }

                break;

            case ProcessStepsTypes.HOMOLOGACAO_DEFINITIVA_INSCRICAO:
            case ProcessStepsTypes.RESULTADO_PRELIMINAR_PROVA:
            case ProcessStepsTypes.RESULTADO_PRELIMINAR_ENTREVISTA:
            case ProcessStepsTypes.RESULTADO_PRELIMINAR_AVALIACAO_CURRICULAR:
            case ProcessStepsTypes.RESULTADO_DEFINITIVO_PROVA:
            case ProcessStepsTypes.RESULTADO_DEFINITIVO_ENTREVISTA:
            case ProcessStepsTypes.RESULTADO_DEFINITIVO_AVALIACAO_CURRICULAR:
            case ProcessStepsTypes.RESULTADO_DEFINITIVO_PROCESSO_SELETIVO:

                if (!currentStep.resultURL && !ignoreResults) {
                    api.showNotify("Disponibilize os resultados antes de avançar", "error", "Atenção", 4);
                    return false;
                }

                break;

            case ProcessStepsTypes.INTERPOSICAO_RECURSO_INSCRICAO:
            case ProcessStepsTypes.INTERPOSICAO_RECURSO_ENTREVISTA:
            case ProcessStepsTypes.INTERPOSICAO_RECURSO_AVALIACAO_CURRICULAR:
            case ProcessStepsTypes.INTERPOSICAO_RECURSO_PROVA:

                for (let sub of subscriptionList) {
                    if (sub.resources?.length > 0) {
                        for (let resource of sub.resources) {
                            if (resource.status == SubscriptionStatus.AGUARDANDO_ANALISE) {
                                api.showNotify("Ainda existem recursos aguardando análise", "error", "Atenção", 4);
                                return false;
                            }
                        }
                    }
                }

                break;
        }

        return true;
    }


    return {
        getCurrentStep,
        calculateTestsGrade,
        orderSubscriptionListByTests,
        isSubscriberApproved,
        calculateBaremaGrade,
        calculateFinalGrade,
        hasPassedInterview,
        hasPassedTest,
        setSubscriptionPlaceName,
        getStepByType,
        hasFileRejected,
        isCurrentStepValid
    }

}

