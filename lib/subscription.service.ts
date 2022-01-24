import { SubscriptionBuilder } from "../builders/subscription.builder";
import { Subscription } from "../models/subscription/subscription";
import { Repository } from "../repositories/repository";
import { GenerateFactory } from "../repositories/generate.factory";
import { Comparator } from "../utils/comparator";
import { ComparatorEnum } from "../utils/comparator.enum";


export class SubscriptionService {

    private repository:Repository;

    constructor(){
        this.repository = GenerateFactory.getInstance().repository();
    }

    async getAllByProcessID(id: string) {
        let comparator:Comparator = new Comparator();
        comparator.add('selectiveProcessID', id, ComparatorEnum.EQUAL);
        let listSubscription:Subscription[] = [];
        let listSubscriptionRegister = await this.repository.find('subscription', comparator);
        for (let subscriptionRegister of listSubscriptionRegister) {
            const subscription:Subscription = new SubscriptionBuilder()
                .register(subscriptionRegister)
            .build();
            listSubscription.push(subscription);
        }
        return listSubscription;
    }

    async getById(id) {
        let subscriptionRegister = await this.repository.get('subscription', id);
        const subscription: Subscription = new SubscriptionBuilder()
            .register(subscriptionRegister)
        .build();
        return subscription;
    }

    async getByUserAndProcess(userID, selectiveProcessID) {
        let comparator:Comparator = new Comparator();
        comparator.add('userID', userID, ComparatorEnum.EQUAL);
        comparator.add('selectiveProcessID', selectiveProcessID, ComparatorEnum.EQUAL);
        let listSubscriptionRegister = await this.repository.find('subscription', comparator);
        if (listSubscriptionRegister.length > 0) {
            const subscription:Subscription = new SubscriptionBuilder()
                .register(listSubscriptionRegister[0])
            .build();
            return subscription;
        }
        return null;
    }


    async save(sub: Subscription) {
        return await this.repository.save("subscription", sub);
    }

    async update(sub: Subscription) {
        return await this.repository.update("subscription", sub);
    }

}

