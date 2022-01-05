import { ComparatorEnum } from "./comparator.enum";
import { ItemComparator } from "./item-comparator";

export class Comparator{

    private itensComparator:ItemComparator[];

    constructor(){
        this.itensComparator = [];
    }

    add(field:string, value:any, comparator:ComparatorEnum){
        let itemComparator:ItemComparator = new ItemComparator();
        itemComparator.field = field;
        itemComparator.value = value;
        itemComparator.comparator = comparator;
        this.itensComparator.push(itemComparator);
    }

    getItens(){
        return this.itensComparator;
    }

}