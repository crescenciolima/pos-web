import { NextApiResponse } from 'next'
import Cors from 'cors'
import multer from 'multer';
import { APIResponse } from '../../models/api-response';
import { SubscriptionService } from '../../lib/subscription.service';
import initMiddleware from '../../utils/init-middleware';
import { BlobCorrected, NextApiRequestWithFormData } from '../../utils/types-util';
import { StoragePaths } from '../../utils/storage-path';
import { v4 as uuidv4 } from 'uuid';
import { Constants } from '../../utils/constants';
import { SubscriptionTypeFile } from '../../models/subscription/subscription-type-file.enum';
import { AuthService } from '../../lib/auth.service';
import { TreatError } from '../../lib/treat-error.service';
import { FileUploadService } from '../../lib/upload.service';

global.XMLHttpRequest = require('xhr2');
const upload = multer({ limits: { fileSize: Constants.MAX_FILE_SIZE } });

const multerAny = initMiddleware(
  upload.any()
);

const cors = initMiddleware(
  Cors({
      methods: ['GET', 'POST', 'OPTIONS'],
  })
)

async function endpoint(req: NextApiRequestWithFormData, res: NextApiResponse) {

  const subscriptionService = new SubscriptionService();
  const authService = new AuthService();
  const treatError = new TreatError();

  await cors(req, res);  

  switch (req.method) {

    case "POST":
        try{
          await multerAny(req, res);

          if(!await authService.checkAuthentication(req)){
            return res.status(401).send(await treatError.message('Usuário não autorizado.'))
          }

          if(!req.files?.length){                
            return res.status(400).json(await treatError.message("Arquivo não encontrado."));
          }
          
          const uploadService = new FileUploadService();
          const { subscriptionID, type } = req.body; 

          const blob: BlobCorrected = req.files[0];
          const path = `${StoragePaths.SUBSCRIPTION}/${subscriptionID}/${type}/`;
          const url = await uploadService.upload(path, blob, uuidv4());

          let subscription = await subscriptionService.getById(subscriptionID);

          if(type === SubscriptionTypeFile.GRADUATION){
            subscription = {...subscription, graduationProofFile: url};
          } else if(type === SubscriptionTypeFile.DOCUMENT){
            subscription = {...subscription, documentFile: url};
          }

          await subscriptionService.update(subscription);
    
          let response: APIResponse = {
            msg: "Arquivo salvo com sucesso!",
            result: subscription
          }
  
          res.status(200).json(response);
        }catch(e){
          console.log(e);
          return res.status(400).json(await treatError.message("Erro ao salvar arquivo"));
        }
        break;
    default:
      break;
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default endpoint;

