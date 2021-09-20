import { NextApiRequest, NextApiResponse } from 'next'
import FileUploadService from '../../lib/upload.service';
import multer from 'multer';
import initMiddleware from '../../utils/init-middleware'
import { NextApiRequestWithFormData, BlobCorrected } from '../../utils/types-util';
import { APIResponse } from '../../models/api-response';
import SelectiveProcessService from '../../lib/selectiveprocess.service';
import { ProcessDocument, SelectiveProcess } from '../../models/selective-process';
import { StoragePaths } from '../../utils/storage-path';

global.XMLHttpRequest = require('xhr2');
const upload = multer();

// for parsing multipart/form-data
// note that Multer limits to 1MB file size by default
const multerAny = initMiddleware(
  upload.any()
);


async function endpoint(req: NextApiRequestWithFormData, res: NextApiResponse) {

  const selectiveProcessService = SelectiveProcessService();

  switch (req.method) {

    case "POST":
      try {
        await multerAny(req, res);

        const blob: BlobCorrected = req.files?.length ? req.files[0] : null;
        const { id, name, type } = req.body


        const uploadService = FileUploadService();

        let url = await uploadService.upload(StoragePaths.SELECTIVE_PROCESS, blob, name);


        const doc: ProcessDocument = {
          name: name,
          url: url
        };


        let process = await selectiveProcessService.getById(id);
        let updateProcess: SelectiveProcess = {
          id: id,
          title: process.title,
          state: process.state
        }

        switch (type) {
          case "Edital":
            let docs = process.processNotices;
            if (!docs) {
              docs = [];
            }
            docs.push(doc);
            updateProcess.processNotices = docs;
            await selectiveProcessService.update(updateProcess);
            break;
          case "Formulário":
            let forms = process.processForms;
            if (!forms) {
              forms = [];
            }
            forms.push(doc);
            updateProcess.processForms = forms;
            await selectiveProcessService.update(updateProcess);
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
        let uploadService = FileUploadService();
        await uploadService.remove(deletedDoc.url);
      } catch (error) {

      }


      let updateProcess: SelectiveProcess = {
        id: id,
        title: process.title,
        state: process.state
      }

      if (processNotices) {
        updateProcess.processNotices = JSON.parse(processNotices);
        await selectiveProcessService.update(updateProcess);
      } else if (processForms) {
        updateProcess.processForms = JSON.parse(processForms);
        await selectiveProcessService.update(updateProcess);
      }

      let deleteResponse: APIResponse = {
        msg: "Arquivo removido com sucesso!",
        result: updateProcess
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

