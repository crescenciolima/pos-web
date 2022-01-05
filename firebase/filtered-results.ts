import { Comparator } from "../utils/comparator";
import { ComparatorEnum } from "../utils/comparator.enum";
import { ItemComparator } from "../utils/item-comparator";

export class FilteredResults{

    static getResults(collection:any, comparator:Comparator){
        for(let itemComparator of comparator.getItens()){

            collection = collection.where(itemComparator.field, this.getComparator(itemComparator.comparator), itemComparator.value);
        }
        return collection.get();
    }

    private static getComparator(comparatorEnum:ComparatorEnum){
        switch(comparatorEnum){
            case ComparatorEnum.EQUAL:
                return '==';
            case ComparatorEnum.DIFFERENT:
                return '!=';
            case ComparatorEnum.MINOR:
                return '<';
            case ComparatorEnum.GREATER:
                return '>';
            case ComparatorEnum.MINOR_EQUAL:
                return '<=';
            case ComparatorEnum.GREATER_EQUAL:
                return '>=';
            default:
                return '==';
        }
    }

}