import { ProcessStepsTypes } from "../models/subscription-process/process-steps-types.enum"

export const ResourceStepsHelper = {
    steps: (): string[] => {
      return [ProcessStepsTypes.INTERPOSICAO_RECURSO_AVALIACAO_CURRICULAR, ProcessStepsTypes.INTERPOSICAO_RECURSO_ENTREVISTA, ProcessStepsTypes.INTERPOSICAO_RECURSO_INSCRICAO, ProcessStepsTypes.INTERPOSICAO_RECURSO_PROVA]
    },
  }
  