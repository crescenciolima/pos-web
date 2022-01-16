import { SelectiveProcess } from "../models/subscription-process/selective-process";
import { Builder } from "./builder";

export class SelectiveProcessBuilder implements Builder<SelectiveProcess>{

    private _selectiveprocess:SelectiveProcess;

    constructor(){
        this._selectiveprocess = new SelectiveProcess();
    }

    register(register: any): Builder<SelectiveProcess> {
        this._selectiveprocess.id = register['id'];
        this._selectiveprocess.title = register['title'];
        this._selectiveprocess.state = register['state'];
        this._selectiveprocess.numberPlaces = register['numberPlaces'];
        this._selectiveprocess.description = register['description'];
        this._selectiveprocess.reservedPlaces = register['reservedPlaces'];
        this._selectiveprocess.baremaCategories = register['baremaCategories'];
        this._selectiveprocess.processForms = register['processForms'];
        this._selectiveprocess.processNotices = register['processNotices'];
        this._selectiveprocess.steps = register['steps'];
        this._selectiveprocess.currentStep = register['currentStep'];
        return this;
    }
    
    build(): SelectiveProcess {
        return this._selectiveprocess;
    }

}