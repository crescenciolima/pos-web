import { NextApiResponse } from 'next'
import Cors from 'cors'
import multer from 'multer';
import { APIResponse } from '../../models/api-response';
import SubscriptionService from '../../lib/subscription.service';
import { Subscription } from '../../models/subscription';
import AuthService from '../../lib/auth.service';
import TreatError from '../../lib/treat-error.service';
import initMiddleware from '../../utils/init-middleware';
import { BlobCorrected, NextApiRequestWithFormData } from '../../utils/types-util';
import FileUploadService from '../../lib/upload.service';
import { StoragePaths } from '../../utils/storage-path';
import { v4 as uuidv4 } from 'uuid';

global.XMLHttpRequest = require('xhr2');
const upload = multer();

const multerAny = initMiddleware(
  upload.any()
);

const cors = initMiddleware(
  Cors({
      methods: ['GET', 'POST', 'OPTIONS'],
  })
)

async function endpoint(req: NextApiRequestWithFormData, res: NextApiResponse) {

  const subscriptionService = SubscriptionService();
  const authService = AuthService();
  const treatError = TreatError();

  await cors(req, res);  

  switch (req.method) {

    case "POST":
        try{
          await multerAny(req, res);

          if(!await authService.checkAuthentication(req)){
            return res.status(401).send(await treatError.general('Usuário não autorizado.'))
          }

          console.log('ARQUIVOS',req.files);    

          if(!req.files?.length){                
            return res.status(400).json(treatError.general("Erro ao salvar arquivo"));
          }
          
          const uploadService = FileUploadService();
          const { subcategoryID, subscriptionID } = req.body;        
          const urls = [];

          req.files.forEach(async (file) => {
            const blob: BlobCorrected = file;
            const path = StoragePaths.SUBSCRIPTION+'/'+subscriptionID+'/'+subcategoryID;
            const url = await uploadService.upload(path, blob, uuidv4());
            urls.push(url);
          })

          let subscription = await subscriptionService.getById(subscriptionID);
          subscription = {
            ...subscription,     
            files: subscription.files && subscription.files.length ? 
            [...subscription.files, { subcategoryID: subcategoryID, files: [...urls] }] : 
            [{ subcategoryID: subcategoryID, files: [...urls] }]        
          };

          await subscriptionService.save(subscription);
    
          let response: APIResponse = {
            msg: "Arquivo salvo com sucesso!",
            result: subscription
          }
  
          res.status(200).json(response);
        }catch(e){
          console.log(e);
          return res.status(400).json(treatError.general("Erro ao salvar arquivo"));
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

