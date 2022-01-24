import { NewsBuilder } from "../builders/news.builder";
import { News } from "../models/news";
import { Repository } from "../repositories/repository";
import { GenerateFactory } from "../repositories/generate.factory";
import { Comparator } from "../utils/comparator";
import { ComparatorEnum } from "../utils/comparator.enum";


export class NewsService {
    
    private repository:Repository;

    constructor(){
        this.repository = GenerateFactory.getInstance().repository();
    }

    //Salva uma nova notícia
    async save(news: News) {
        await this.repository.save("news", news);
    }

    //Atualiza uma notícia existente utilizando o ID
    async update(news: News) {
        await this.repository.update("news", news);
    }

    //Remove uma notícia existente utilizando o ID
    async remove(id: any) {
        await this.repository.remove("news", id);
    }

    //Consulta todas as notícias
    async getAll() {
        let listNews:News[] = [];
        let listNewsRegister = await this.repository.getAll("news");
        for(let newsRegister of listNewsRegister){
            const news: News = new NewsBuilder()
                .register(newsRegister)
            .build();
            listNews.push(news);
        }
        return listNews;
    }

    async getFirstResults() {
        let comparator:Comparator = new Comparator();
        let registerNews:[] = await this.repository.find("news", comparator);
        if (registerNews.length==0){
            return [];
        }
        let listNews:News[] = [];
        for(let i=0; i < 3 && i < registerNews.length; i++){
            let register = registerNews[i];
            const news: News = new NewsBuilder()
                .register(register)
            .build();
            listNews.push(news);
        }
        return [];
    }


    async getById(id) {
        let register = await this.repository.get("news", id);
        const news: News = new NewsBuilder()
            .register(register)
        .build();
        return news;
    }

    async getBySlug(slug) {
        let comparator:Comparator = new Comparator();
        comparator.add('slug', slug, ComparatorEnum.EQUAL);
        let snapshot = await this.repository.find('news', comparator);
        const news: News = new NewsBuilder()
            .register(snapshot)
        .build();
        return news;
    }

    createSlugFromTilte(title: string): string {
        let slug;

        // convert to lower case
        slug = title.toLowerCase();

        // remove special characters
        slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
        // The /gi modifier is used to do a case insensitive search of all occurrences of a regular expression in a string

        // replace spaces with dash symbols
        slug = slug.replace(/ /gi, "-");

        // remove consecutive dash symbols 
        slug = slug.replace(/\-\-\-\-\-/gi, '-');
        slug = slug.replace(/\-\-\-\-/gi, '-');
        slug = slug.replace(/\-\-\-/gi, '-');
        slug = slug.replace(/\-\-/gi, '-');

        // remove the unwanted dash symbols at the beginning and the end of the slug
        slug = '@' + slug + '@';
        slug = slug.replace(/\@\-|\-\@|\@/gi, '');
        return slug;
    }
}

