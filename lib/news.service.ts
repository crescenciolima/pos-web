import { News } from "../models/news";
import firestore from "../utils/firestore-util";


export default function NewsService() {

    const newsRef = firestore.collection("news");
    const resultsPPage = 10;

    async function getAll() {
        let newsList = [];

        await newsRef.orderBy('date', 'desc').get().then(
            (snapshot) => {
                snapshot.forEach(
                    (result) => {
                        const id = result.id;
                        const doc = result.data();
                        const news: News = {
                            id: id,
                            title: doc['title'],
                            text: doc['text'],
                            coverURL: doc['coverURL'],
                            date: doc['date'],
                            slug: doc['slug']
                        }
                        newsList.push(news);
                    });

            }
        ).catch(
        );

        return newsList;

    }

    async function getPage(page: number) {
        let newsList = [];

        await newsRef.orderBy('date', 'desc').get().then(
            (snapshot) => {
                snapshot.forEach(
                    (result) => {
                        const id = result.id;
                        const doc = result.data();
                        const news: News = {
                            id: id,
                            title: doc['title'],
                            text: doc['text'],
                            coverURL: doc['coverURL'],
                            date: doc['date'],
                            slug: doc['slug']
                        }
                        newsList.push(news);
                    });

            }
        ).catch(
        );

        return newsList;

    }

    async function save(news: News) {
        newsRef.add(news);
    }

    async function update(news: News) {
        newsRef.doc(news.id).set(news);
    }

    async function remove(teacherID: string) {
        await newsRef.doc(teacherID).delete();
    }

    async function getById(id) {
        let snapshot = await newsRef.doc(id).get();
        const doc = snapshot.data();
        const news: News = {
            id: id,
            title: doc['title'],
            text: doc['text'],
            coverURL: doc['coverURL'],
            date: doc['date'],
            slug: doc['slug']
        }

        return news;
    }

    async function getBySlug(slug) {
        let snapshot = await newsRef.where("slug","==",slug).get();
        const doc = snapshot.docs[0];
        const data = doc.data();
        const news: News = {
            id: doc.id,
            title: data['title'],
            text: data['text'],
            coverURL: data['coverURL'],
            date: data['date'],
            slug: data['slug']
        }

        return news;
    }

    function createSlugFromTilte(title: string): string {
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


    return {
        getAll,
        getPage,
        save,
        update,
        remove,
        getById,
        getBySlug,
        createSlugFromTilte
    }

}

