import { Works } from "../models/works";
import { Builder } from "./builder";

export class WorksBuilder implements Builder<Works>{

    private _works:Works;

    constructor(){
        this._works = new Works();
    }

    register(register: any): Builder<Works> {
        this._works.id = register['id'];
        this._works.title = register['title'];
        this._works.text = register['text'];
        this._works.date = register['date'];
        this._works.url = register['url'];
        this._works.authors = register['authors'];
        return this;
    }
    
    build(): Works {
        return this._works;
    }

}