import { NextApiResponse } from 'next'
import Cors from 'cors'
import AuthService from '../../lib/auth.service';
import FileUploadService from '../../lib/upload.service';
import { StoragePaths } from '../../utils/storage-path';
import multer from 'multer';
import initMiddleware from '../../utils/init-middleware'
import { NextApiRequestWithFormData, BlobCorrected } from '../../utils/types-util';
import { APIResponse } from '../../models/api-response';
import NewsService from '../../lib/news.service';
import { News } from '../../models/news';
import fire from '../../utils/firebase-util';
import { SubscriptionResource, SubscriptionStatus } from '../../models/subscription';
import SubscriptionService from '../../lib/subscription.service';
import TreatError from '../../lib/treat-error.service';
import { v4 as uuidv4 } from 'uuid';
import SelectiveProcessService from '../../lib/selectiveprocess.service';
import { ResourceStepsHelper } from '../../helpers/resource-steps-helper';
import ResourceUtil from '../../lib/resource.util';
import { Constants } from '../../utils/constants';

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

  const subscriptionService = SubscriptionService();
  const selectiveProcessService = SelectiveProcessService();
  const treatError = TreatError();
  const resourceSteps = ResourceStepsHelper.steps();
  const authService = AuthService();
  const resourceUtil = ResourceUtil();

  await cors(req, res);

  if(!await authService.checkAuthentication(req)){
    return res.status(401).send(await treatError.general('Usuário não autorizado.'))
  }

  switch (req.method) {

    case "POST":
      try{
        await multerAny(req, res);

        const { subscriptionID, resourceID } = req.body;        

        let subscription = await subscriptionService.getById(subscriptionID);
        
        if(!subscription) {
          return res.status(404).json(await treatError.general("Inscrição não encontrada."));
        }

        if(!req.files?.length){                
          return res.status(400).json(await treatError.general("Arquivo não encontrado."));
        }

        const resourceFound = subscription.resources.find((resource) => resource.id === resourceID);

        if(!resourceFound) {          
          return res.status(404).json(await treatError.general("Recurso não encontrado."));
        }
                              
        const uploadService = FileUploadService();
        const urls = [];    
        let subscriptionResources = [];  

        for (let i = 0; i < req.files.length; i++){
          const blob: BlobCorrected = req.files[i];
          const path = `${StoragePaths.SUBSCRIPTION}${subscriptionID}/${StoragePaths.RESOURCE}`;
          const url = await uploadService.upload(path, blob, uuidv4());
          urls.push(url);
        }
        console.log(subscription.resources);
        subscriptionResources = subscription.resources.map(subscriptionResource => {
          console.log(subscriptionResource);
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
        return res.status(400).json(await treatError.general("Erro ao salvar arquivo do Recurso."));
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

