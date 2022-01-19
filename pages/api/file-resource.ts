import { NextApiResponse } from 'next'
import Cors from 'cors'
import { StoragePaths } from '../../utils/storage-path';
import multer from 'multer';
import initMiddleware from '../../utils/init-middleware'
import { NextApiRequestWithFormData, BlobCorrected } from '../../utils/types-util';
import { APIResponse } from '../../models/api-response';
import { SubscriptionService } from '../../lib/subscription.service';
import { v4 as uuidv4 } from 'uuid';
import { Constants } from '../../utils/constants';
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
  const treatError = new TreatError();
  const authService = new AuthService();
  
  await cors(req, res);

  if(!await authService.checkAuthentication(req)){
    return res.status(401).send(await treatError.message('Usuário não autorizado.'))
  }

  switch (req.method) {

    case "POST":
      try{
        await multerAny(req, res);

        const { subscriptionID, resourceID } = req.body;        

        let subscription = await subscriptionService.getById(subscriptionID);
        
        if(!subscription) {
          return res.status(404).json(await treatError.message("Inscrição não encontrada."));
        }

        if(!req.files?.length){                
          return res.status(400).json(await treatError.message("Arquivo não encontrado."));
        }

        const resourceFound = subscription.resources.find((resource) => resource.id === resourceID);

        if(!resourceFound) {          
          return res.status(404).json(await treatError.message("Recurso não encontrado."));
        }
                              
        const uploadService = new FileUploadService();
        const urls = [];    
        let subscriptionResources = [];  

        for (let i = 0; i < req.files.length; i++){
          const blob: BlobCorrected = req.files[i];
          const path = `${StoragePaths.SUBSCRIPTION}${subscriptionID}/${StoragePaths.RESOURCE}`;
          const url = await uploadService.upload(path, blob, uuidv4());
          urls.push(url);
        }
        subscriptionResources = subscription.resources.map(subscriptionResource => {
          if(subscriptionResource.id === resourceID){
            subscriptionResource.files = subscriptionResource.files ? [...subscriptionResource.files, ...urls] : [...urls]
          }
          return subscriptionResource;
        })

        subscription = {
          ...subscription,     
          resources: subscriptionResources        
        };
        
        await subscriptionService.update(subscription); 
  
        let response: APIResponse = {
          msg: "Arquivo do Recurso salvo com sucesso!",
          result: subscription
        }
  
        res.status(200).json(response);
      }catch(e){
        console.log(e);
        return res.status(400).json(await treatError.message("Erro ao salvar arquivo do Recurso."));
      }

      break;
  
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

