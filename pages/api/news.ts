import { NextApiResponse } from 'next'
import { StoragePaths } from '../../utils/storage-path';
import multer from 'multer';
import initMiddleware from '../../utils/init-middleware'
import { NextApiRequestWithFormData, BlobCorrected } from '../../utils/types-util';
import { APIResponse } from '../../models/api-response';
import { News } from '../../models/news';
import { Constants } from '../../utils/constants';
import { NewsService } from '../../lib/news.service';
import { AuthService } from '../../lib/auth.service';
import { TreatError } from '../../lib/treat-error.service';
import { FileUploadService } from '../../lib/upload.service';

global.XMLHttpRequest = require('xhr2');
const upload = multer({ limits: { fileSize: Constants.MAX_FILE_SIZE } });

// for parsing multipart/form-data
// note that Multer limits to 1MB file size by default
const multerAny = initMiddleware(
  upload.any()
);


async function endpoint(req: NextApiRequestWithFormData, res: NextApiResponse) {

  const newsService = new NewsService();
  const authService = new AuthService();
  const treatError = new TreatError();

  switch (req.method) {

    case "POST":
      try{
        await multerAny(req, res);
        
        if(!await authService.checkAuthentication(req)){
          return res.status(401).send(await treatError.message('Usuário não autorizado.'))
        }

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
          const uploadService = new FileUploadService();
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
        const newsList =  await newsService.getAll();
        getResponse.result = newsList;
      }

      res.status(200).json(getResponse);
      break

    case "DELETE":
      if(!await authService.checkAuthentication(req)){
        return res.status(401).send(await treatError.message('Usuário não autorizado.'))
      }
      
      let newsID = req.query.id.toString();
      const deletedNews = await newsService.getById(newsID);
      let uploadService = new FileUploadService();
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

