import { SubscriptionStatus } from "./subscription-resource.enum";

export class SubscriptionFile{
    uuid: string;
    url: string;
    status: SubscriptionStatus;
    observation?: string;
}