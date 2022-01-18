import { NextApiRequest, NextApiResponse } from 'next'
import { APIResponse } from '../../models/api-response';
import { SubscriptionService } from '../../lib/subscription.service';
import Cors from 'cors'
import initMiddleware from '../../utils/init-middleware';
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from '../../models/subscription/subscription';
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
  const authService = new AuthService();
  const treatError = new TreatError();

  await cors(req, res);

  if(!await authService.checkAuthentication(req)){
    return res.status(401).send(await treatError.message('Usuário não autorizado.'))
  }

  const authorization = req.headers.authorization;

  switch (req.method) {

        case "POST":
            try{
                const id = req.body.id;
                let subscription: Subscription = req.body;
        
                if (id) {
                    subscription.id = id;
                } 
                const currentUserId = await authService.currentUser(authorization);

                subscription = { 
                  ...subscription,
                  userID: currentUserId as string, 
                  protocol: uuidv4(),
                  subscriptionDate: (new Date()).toISOString(),
                  status: SubscriptionStatus.AGUARDANDO_ANALISE,
                };

                const _subscription = await subscriptionService.save(subscription); 
                
                let response: APIResponse = {
                  msg: "Inscrição salva com sucesso!",
                  result: {...subscription, id: _subscription.id}
                }
        
                res.status(200).json(response);
            }catch(e){
                return res.status(400).json(await treatError.message("Erro ao salvar inscrição."));
            }

            break;
    case "GET":

      let getResponse: APIResponse = {
        msg: "",
      };

      if (req.query.processID) {
        const subs = await subscriptionService.getAllByProcessID(req.query.processID.toString());
        getResponse.result = subs;
      } else if (req.query.id) {
        const sub = await subscriptionService.getById(req.query.id);
        getResponse.result = sub;
      }

      res.status(200).json(getResponse);
      break

    case "DELETE":
      // let newsID = req.query.id.toString();
      // const deletedNews = await selectiveProcessService.getById(newsID);
      // // await uploadService.remove(deletedNews.coverURL);

      // let uploadService = FileUploadService();
      // // await selectiveProcessService.remove(newsID);

      //   result: {}

      // let deleteResponse: APIResponse = {
      //   msg: "Notícia removida com sucesso!",
      // }
      // res.status(200).json(deleteResponse);
      break;

      console.log(req.method)
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
