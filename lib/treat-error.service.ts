

import { RepositoryFactory } from "../repositories/repository.factory";
import { TreatErrorRepository } from "../repositories/treat-error.repository";

export class TreatError {

  private treatErrorRepository:TreatErrorRepository;

  constructor(){
      this.treatErrorRepository = RepositoryFactory.treatErrorRepository();
  }

  async message(result: any){    
      return await this.treatErrorRepository.message(result);
  }
}