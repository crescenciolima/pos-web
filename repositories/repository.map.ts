import { RepositoryFactory } from "./factories/repository.factory";
import { AlternativeRepositoryFactory } from "./factories/alternative-repository.factory";
import { FirebaseRepositoryFactory } from "./factories/firebase-repository.factory";

export class RepositoryMap{
    static map = new Map<string, RepositoryFactory>([
        ['ALTERNATIVE', new AlternativeRepositoryFactory()],
        ['FIREBASE', new FirebaseRepositoryFactory()],
    ]);
}

 