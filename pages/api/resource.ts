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

        const { subscriptionID, justification } = req.body;        

        const subscription = await subscriptionService.getById(subscriptionID);
        
        if(!subscription) {
          return res.status(404).json(await treatError.general("Inscrição não encontrada."));
        }

        const selectiveProcess = await selectiveProcessService.getById(subscription.selectiveProcessID)

        if(!resourceUtil.canRequestResource(subscription, selectiveProcess)){
          return res.status(400).json(await treatError.general("A etapa atual não permite recurso."));
        }
        
        let currentStep = selectiveProcess.steps.find((step) => selectiveProcess.currentStep === step.order);

        const resource: SubscriptionResource = {
          justification,
          date: (new Date()).toISOString(),
          status: SubscriptionStatus.AGUARDANDO_ANALISE,
          step: currentStep.type
        }

        if(req.files?.length > 0){                        
          const uploadService = FileUploadService();
          const urls = [];      
  
          for (let i = 0; i < req.files.length; i++){
            const blob: BlobCorrected = req.files[i];
            const path = `${StoragePaths.SUBSCRIPTION}${subscriptionID}/${StoragePaths.RESOURCE}`;
            const url = await uploadService.upload(path, blob, uuidv4());
            urls.push(url);
          }  

          resource.files = urls;
        }

        if(subscription.resources){
          subscription.resources.push(resource);
        }else{          
          subscription.resources = [resource];
        }
        
        await subscriptionService.update(subscription); 
  
        let response: APIResponse = {
          msg: "Recurso salvo com sucesso!",
          result: resource
        }
  
        res.status(200).json(response);
      }catch(e){
        console.log(e);
        return res.status(400).json(await treatError.general("Erro ao salvar recurso."));
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

