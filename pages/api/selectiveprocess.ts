import { NextApiRequest, NextApiResponse } from 'next'
import FileUploadService from '../../lib/upload.service';
import { StoragePaths } from '../../lib/storage-path';
import multer from 'multer';
import initMiddleware from '../../lib/init-middleware'
import { NextApiRequestWithFormData, BlobCorrected } from '../../utils/types-util';
import { APIResponse } from '../../models/api-response';
import { News } from '../../models/news';
import SelectiveProcessService from '../../lib/selectiveprocess.service';
import { SelectiveProcess } from '../../models/selective-process';

// global.XMLHttpRequest = require('xhr2');
// const upload = multer();

// for parsing multipart/form-data
// note that Multer limits to 1MB file size by default
// const multerAny = initMiddleware(
//   upload.any()
// );


async function endpoint(req: NextApiRequest , res: NextApiResponse) {

  const selectiveProcessService = SelectiveProcessService();

  switch (req.method) {

    case "POST":
      try {
        // await multerAny(req, res);

        let response: APIResponse = {
          msg: "Processo seletivo salvo com sucesso!",
          result: null
        }
        const body = await req.body;
     
        if (!body.id) {
          //New Process

          const { title, creationDate, open, inConstruction }: SelectiveProcess = body

          const newProcess: SelectiveProcess = {
            title: title,
            creationDate: creationDate,
            open: open,
            inConstruction: inConstruction,
            numberPlaces: 0,
            reservedPlaces: [
              {name:"Servidores do IFBA", numberPlaces: 0},
              {name:"Pessoas com Deficiência", numberPlaces: 0},
              {name:"Negros (Pretos e Pardos) ", numberPlaces: 0},
              {name:"Indígenas", numberPlaces: 0},
              {name:"Quilombolas", numberPlaces: 0},
              {name:"Pessoas Trans (Transexuais, Transgêneros e Travestis)", numberPlaces: 0},
            ]
          }

          await selectiveProcessService.save(newProcess);

          response.result = newProcess;
        }else{
          await selectiveProcessService.update(body);
          response.result = body;
        }


        // const { id, title, text, coverURL, date }: News = req.body;

        // const news: News = {
        //   title: title,
        //   text: text,
        //   coverURL: coverURL,
        //   date: date,
        //   slug: ""
        // }

        // if(blob){
        //   const uploadService = FileUploadService();
        //   let url = await uploadService.upload(StoragePaths.NEWS_COVER, blob, date.toString());

        //   news.coverURL = url;
        // }

        // if(id){
        //   news.id = id;
        //   // await selectiveProcessService.update(news);
        // }else{
        //   // await selectiveProcessService.save(news);
        // }

      
        res.status(200).json(response);
      } catch (e) {
        console.log(e);
        return res.json({ error: "error" });
      }

      break;

    case "GET":

      let getResponse: APIResponse = {
        msg: "",
        result: null
      };

      if (req.query.inconstruction == "true") {
        const process = await selectiveProcessService.getInConstruction();
        getResponse.result = process;
      } else {
        // const newsList = req.query.page ? await selectiveProcessService.getPage(+req.query.page.toString()) : await selectiveProcessService.getAll();
        // getResponse.result = newsList;
      }

      res.status(200).json(getResponse);
      break

    case "DELETE":
      let newsID = req.query.id.toString();
      const deletedNews = await selectiveProcessService.getById(newsID);
      let uploadService = FileUploadService();
      // await uploadService.remove(deletedNews.coverURL);

      // await selectiveProcessService.remove(newsID);

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
    bodyParser: true,
  },
}

export default endpoint;

