

import { GenerateFactory } from "../repositories/generate.factory";
import { TreatErrorRepository } from "../repositories/treat-error.repository";

export class TreatError {

  private treatErrorRepository:TreatErrorRepository;

  constructor(){
      this.treatErrorRepository = GenerateFactory.getInstance().treatErrorRepository();
  }

  async message(result: any){    
      return await this.treatErrorRepository.message(result);
  }
}