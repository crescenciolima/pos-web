import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import initMiddleware from '../../utils/init-middleware'
import { APIResponse } from '../../models/api-response';
import { SubscriptionService } from '../../lib/subscription.service';
import { v4 as uuidv4 } from 'uuid';
import ResourceUtil from '../../utils/resource.util';
import { SelectiveProcessService } from '../../lib/selectiveprocess.service';
import { SubscriptionResource } from '../../models/subscription/subscription-resource';
import { SubscriptionStatus } from '../../models/subscription/subscription-resource.enum';
import { AuthService } from '../../lib/auth.service';
import { TreatError } from '../../lib/treat-error.service';

const cors = initMiddleware(
  Cors({
      methods: ['GET', 'POST', 'OPTIONS'],
  })
)

async function endpoint(req: NextApiRequest, res: NextApiResponse) {

  const subscriptionService = new SubscriptionService();
  const selectiveProcessService = new SelectiveProcessService();
  const treatError = new TreatError();
  const authService = new AuthService();
  const resourceUtil = ResourceUtil();

  await cors(req, res);

  if(!await authService.checkAuthentication(req)){
    return res.status(401).send(await treatError.message('Usuário não autorizado.'))
  }

  switch (req.method) {

    case "POST":
      try{
        console.log(req.body);
        const { subscriptionID, justification } = req.body;        

        const subscription = await subscriptionService.getById(subscriptionID);
        
        if(!subscription) {
          return res.status(404).json(await treatError.message("Inscrição não encontrada."));
        }

        const selectiveProcess = await selectiveProcessService.getById(subscription.selectiveProcessID)

        if(!resourceUtil.canRequestResource(subscription, selectiveProcess)){
          return res.status(400).json(await treatError.message("A etapa atual não permite recurso."));
        }
        
        let currentStep = selectiveProcess.steps.find((step) => selectiveProcess.currentStep === step.order);

        const resource: SubscriptionResource = {
          id: `${subscriptionID}${uuidv4()}`,
          justification,
          date: (new Date()).toISOString(),
          status: SubscriptionStatus.AGUARDANDO_ANALISE,
          step: currentStep.type
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
        return res.status(400).json(await treatError.message("Erro ao salvar recurso."));
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
    bodyParser: true,
  },
}

export default endpoint;

