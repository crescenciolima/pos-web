import { NextApiRequest, NextApiResponse } from 'next'
import multer from 'multer';
import initMiddleware from '../../utils/init-middleware'
import { NextApiRequestWithFormData, BlobCorrected } from '../../utils/types-util';
import { APIResponse } from '../../models/api-response';
import { StoragePaths } from '../../utils/storage-path';
import { Constants } from '../../utils/constants';
import { SelectiveProcessService } from '../../lib/selectiveprocess.service';
import { SelectiveProcess } from '../../models/subscription-process/selective-process';
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
        const { id, currentStepType } = req.body



        const uploadService = new FileUploadService();
        let process = await selectiveProcessService.getById(id);
        let steps = process.steps;
      

        const step = steps.find(st => st.type == currentStepType);

        let name = step.type + process.title;

        let url = await uploadService.upload(StoragePaths.SELECTIVE_PROCESS_RESULTS, blob, name);

       
        step.resultURL = url;

        await selectiveProcessService.update(process);


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

