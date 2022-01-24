import { AuthRepository } from "../auth.repository";
import { Repository } from "../repository";
import { StorageRepository } from "../storage-repository";
import { TreatErrorRepository } from "../treat-error.repository";

export interface RepositoryFactory{
    repository():Repository;
    authRepository():AuthRepository;
    treatErrorRepository():TreatErrorRepository;
    storageRepository():StorageRepository;
}