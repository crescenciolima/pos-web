import { BaremaSubCategory } from "./barema-sub-category";

export interface BaremaCategory {
    name: string;
    maxPoints: number;
    subcategories: BaremaSubCategory[];
}
