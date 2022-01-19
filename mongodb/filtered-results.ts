import { Comparator } from "../utils/comparator";
import { ComparatorEnum } from "../utils/comparator.enum";

export class FilteredResults{

    static getResults(comparator:Comparator){
        let filters:any = {};
        for(let itemComparator of comparator.getItens()){
            filters[itemComparator.field] = this.getComparator(itemComparator.comparator, itemComparator.value);
        }
        return filters;
    }

    private static getComparator(comparatorEnum:ComparatorEnum, value:any){
        switch(comparatorEnum){
            case ComparatorEnum.EQUAL:
                return {$eq: value};
            case ComparatorEnum.DIFFERENT:
                return {$ne: value};
            case ComparatorEnum.MINOR:
                return {$lt: value};
            case ComparatorEnum.GREATER:
                return {$gt: value};
            case ComparatorEnum.MINOR_EQUAL:
                return {$lte: value};
            case ComparatorEnum.GREATER_EQUAL:
                return {$gte: value};
            case ComparatorEnum.IN:
                return {$in: value};
            default:
                return {$eq: value};
        }
    }

}