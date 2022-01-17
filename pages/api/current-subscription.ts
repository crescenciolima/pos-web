import { NextApiRequest, NextApiResponse } from 'next'
import { APIResponse } from '../../models/api-response';
import TreatError from '../../lib/treat-error.service';
import Cors from 'cors'
import initMiddleware from '../../utils/init-middleware';
import { SelectiveProcessService } from '../../lib/selectiveprocess.service';
import { SubscriptionService } from '../../lib/subscription.service';
import { AuthService } from '../../lib/auth.service';


const cors = initMiddleware(
  Cors({
      methods: ['GET', 'POST', 'OPTIONS'],
  })
)

async function endpoint(req: NextApiRequest, res: NextApiResponse) {

  const subscriptionService = new SubscriptionService();
  const authService = new AuthService();
  const treatError = TreatError();

  await cors(req, res);

  if(!await authService.checkAuthentication(req)){
    return res.status(401).send(await treatError.general('Usuário não autorizado.'))
  }

  const authorization = req.headers.authorization;

  switch (req.method) {
    case "GET":     
        const currentUserId = await authService.currentUser(authorization);   

        if(!currentUserId){            
          return res.status(401).json(await treatError.general('Usuário não autorizado.'));
        }

        const selectiveProcessService = new SelectiveProcessService();
        
        const process = await selectiveProcessService.getOpen();
        
        if(!process){            
          return res.status(404).json(await treatError.general('Processo seletivo não encontrado.'));
        }

        const subs = await subscriptionService.getByUserAndProcess(currentUserId, process.id);

        let response: APIResponse = {
            msg: "Incrição atual encontrada com sucesso!",
            result: subs
        }
        res.status(200).json(response);
    default:
      break;
      res.status(405);
  }

}


export const config = {
  api: {
    bodyParser: true,
  },
}

export default endpoint;
