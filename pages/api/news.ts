import { NextApiResponse } from 'next'
import FileUploadService from '../../lib/upload.service';
import { StoragePaths } from '../../lib/storage-path';
import multer from 'multer';
import initMiddleware from '../../lib/init-middleware'
import { NextApiRequestWithFormData, BlobCorrected } from '../../utils/types-util';
import { APIResponse } from '../../models/api-response';
import NewsService from '../../lib/news.service';
import { News } from '../../models/news';

global.XMLHttpRequest = require('xhr2');
const upload = multer();

// for parsing multipart/form-data
// note that Multer limits to 1MB file size by default
const multerAny = initMiddleware(
  upload.any()
);


async function endpoint(req: NextApiRequestWithFormData, res: NextApiResponse) {

  const newsService = NewsService();

  switch (req.method) {

    case "POST":
      try{
        await multerAny(req, res);

        const blob: BlobCorrected = req.files?.length ? req.files[0] : null;
        const { id, title, text, coverURL, date }: News = req.body;
  
        const news: News = {
          title: title,
          text: text,
          coverURL: coverURL,
          date: date,
          slug: newsService.createSlugFromTilte(title)
        }
  
        if(blob){
          const uploadService = FileUploadService();
          let url = await uploadService.upload(StoragePaths.NEWS_COVER, blob, date.toString());
  
          news.coverURL = url;
        }
  
        if(id){
          news.id = id;
          await newsService.update(news);
        }else{
          await newsService.save(news);
        }
  
        let response: APIResponse = {
          msg: "Notícia salva com sucesso!",
          result: news
        }
  
        res.status(200).json(response);
      }catch(e){
        console.log(e);
        return res.json({error: "error"});
      }

      break;

    case "GET":

      let getResponse: APIResponse = {
        msg: "",
        result: null
      };

      if (req.query.id) {
        const news = await newsService.getById(req.query.id);
        getResponse.result = news;
      } else {
        const newsList = req.query.page ? await newsService.getPage(+req.query.page.toString()) : await newsService.getAll();
        getResponse.result = newsList;
      }

      res.status(200).json(getResponse);
      break

    case "DELETE":
      let newsID = req.query.id.toString();
      const deletedNews = await newsService.getById(newsID);
      let uploadService = FileUploadService();
      await uploadService.remove(deletedNews.coverURL);

      await newsService.remove(newsID);

      let deleteResponse: APIResponse = {
        msg: "Notícia removida com sucesso!",
        result: {}
      }

      res.status(200).json(deleteResponse);

    default:
      console.log(req.method)
      res.status(405);
      break;
  }

}


export const config = {
  api: {
    bodyParser: false,
  },
}

export default endpoint;
