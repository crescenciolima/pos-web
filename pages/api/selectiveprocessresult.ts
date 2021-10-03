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
        const { id, currentStepType } = req.body



        const uploadService = FileUploadService();
        let process = await selectiveProcessService.getById(id);
        let steps = process.steps;
      

        const step = steps.find(st => st.type == currentStepType);

        let name = step.type + process.title;

        let url = await uploadService.upload(StoragePaths.SELECTIVE_PROCESS_RESULTS, blob, name);

        if(step.resultURL){
          await uploadService.remove(step.resultURL)
        }

        step.resultURL = url;

        let updateProcess: SelectiveProcess = {
          id: id,
          title: process.title,
          state: process.state,
          steps: steps
        }

        await selectiveProcessService.update(updateProcess);


        let response: APIResponse = {
          msg: "Resultado salvo com sucesso!",
          result: step
        }


        res.status(200).json(response);
      } catch (e) {
        console.log(e);
        return res.json({ error: "error" });
      }

      break;


    case "DELETE":

   

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

