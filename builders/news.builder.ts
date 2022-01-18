import { News } from "../models/news";
import { Builder } from "./builder";

export class NewsBuilder implements Builder<News>{

    private _news:News;

    constructor(){
        this._news = new News();
    }

    register(register: any): Builder<News> {
        this._news.id = register['id'];
        this._news.title = register['title'];
        this._news.text = register['text'];
        this._news.coverURL = register['coverURL'];
        this._news.date = register['date'];
        this._news.slug = register['slug'];
        this._news.dateString = register['dateString'] || '';
        return this;
    }
    
    build(): News {
        return this._news;
    }

}