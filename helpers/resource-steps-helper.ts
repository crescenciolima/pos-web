import { ProcessStepsTypes } from "../models/selective-process";

export const ResourceStepsHelper = {
    steps: (): string[] => {
      return [ProcessStepsTypes.INTERPOSICAO_RECURSO_AVALIACAO_CURRICULAR, ProcessStepsTypes.INTERPOSICAO_RECURSO_ENTREVISTA, ProcessStepsTypes.INTERPOSICAO_RECURSO_INSCRICAO, ProcessStepsTypes.INTERPOSICAO_RECURSO_PROVA]
    },
  }
  