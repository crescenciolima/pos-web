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
import { SubscriptionStatus } from '../../models/subscription/subscription-resource.enum';
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
          const { subcategoryID, subscriptionID } = req.body;  
          const urls = [];      

          for (let i = 0; i < req.files.length; i++){
            const blob: BlobCorrected = req.files[i];
            const path = `${StoragePaths.SUBSCRIPTION}/${subscriptionID}/${subcategoryID}`;
            const url = await uploadService.upload(path, blob, uuidv4());
            urls.push({uuid: uuidv4(), url: url, status: SubscriptionStatus.AGUARDANDO_ANALISE, observation: ''});
          }
          
          let subscription = await subscriptionService.getById(subscriptionID);

          let subscriptionFiles = [];
          if(subscription.files && subscription.files.length){
            const subcategoryFound = subscription.files.find((subcategory) => subcategory.subcategoryID === subcategoryID);

            if(subcategoryFound){
              subscriptionFiles = subscription.files.map(subscriptionFile => {
                if(subscriptionFile.subcategoryID === subcategoryID){
                  subscriptionFile.files = subscriptionFile.files ? [...subscriptionFile.files, ...urls] : [...urls]
                }
                return subscriptionFile;
              })
            }else{
              subscriptionFiles = [...subscription.files, { subcategoryID: subcategoryID, files: urls }] 
            }

          }else{
            subscriptionFiles = [{ subcategoryID: subcategoryID, files: urls }] 
          }

          subscription = {
            ...subscription,     
            files: subscriptionFiles        
          };

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

