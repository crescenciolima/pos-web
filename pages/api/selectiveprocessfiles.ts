import { NextApiResponse } from 'next'
import multer from 'multer';
import initMiddleware from '../../utils/init-middleware'
import { NextApiRequestWithFormData, BlobCorrected } from '../../utils/types-util';
import { APIResponse } from '../../models/api-response';
import { StoragePaths } from '../../utils/storage-path';
import { Constants } from '../../utils/constants';
import { SelectiveProcessService } from '../../lib/selectiveprocess.service';
import { ProcessDocument } from '../../models/subscription-process/process-document';
import { FileUploadService } from '../../lib/upload.service';

global.XMLHttpRequest = require('xhr2');
const upload = multer({ limits: { fileSize: Constants.MAX_FILE_SIZE } });

// for parsing multipart/form-data
// note that Multer limits to 1MB file size by default
const multerAny = initMiddleware(
  upload.any()
);


async function endpoint(req: NextApiRequestWithFormData, res: NextApiResponse) {

  const selectiveProcessService = new SelectiveProcessService();

  switch (req.method) {

    case "POST":
      try {
        await multerAny(req, res);

        const blob: BlobCorrected = req.files?.length ? req.files[0] : null;
        const { id, name, type } = req.body


        const uploadService = new FileUploadService();

        let url = await uploadService.upload(StoragePaths.SELECTIVE_PROCESS, blob, name);


        const doc: ProcessDocument = {
          name: name,
          url: url
        };


        let process = await selectiveProcessService.getById(id);
        
        switch (type) {
          case "Edital":
            let docs = process.processNotices;
            if (!docs) {
              docs = [];
            }
            docs.push(doc);
            process.processNotices = docs;
            await selectiveProcessService.update(process);
            break;
          case "Formulário":
            let forms = process.processForms;
            if (!forms) {
              forms = [];
            }
            forms.push(doc);
            process.processForms = forms;
            await selectiveProcessService.update(process);
            break;
        }



        let response: APIResponse = {
          msg: "Processo seletivo salvo com sucesso!",
          result: process
        }


        res.status(200).json(response);
      } catch (e) {
        console.log(e);
        return res.json({ error: "error" });
      }

      break;


    case "DELETE":

      await multerAny(req, res);

      const { id, document, processNotices, processForms } = req.body
      let process = await selectiveProcessService.getById(id);

      try {
        const deletedDoc = JSON.parse(document);
        let uploadService = new FileUploadService();
        await uploadService.remove(deletedDoc.url);
      } catch (error) {

      }


      if (processNotices) {
        process.processNotices = JSON.parse(processNotices);
        await selectiveProcessService.update(process);
      } else if (processForms) {
        process.processForms = JSON.parse(processForms);
        await selectiveProcessService.update(process);
      }

      let deleteResponse: APIResponse = {
        msg: "Arquivo removido com sucesso!",
        result: process
      }

      res.status(200).json(deleteResponse);
      break;


    default:
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

