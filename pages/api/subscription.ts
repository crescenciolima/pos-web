import { NextApiRequest, NextApiResponse } from 'next'
import { APIResponse } from '../../models/api-response';
import SubscriptionService from '../../lib/subscription.service';
import { Subscription } from '../../models/subscription';
import AuthService from '../../lib/auth.service';
import TreatError from '../../lib/treat-error.service';
import Cors from 'cors'
import initMiddleware from '../../utils/init-middleware';

const cors = initMiddleware(
  Cors({
      methods: ['GET', 'POST', 'OPTIONS'],
  })
)

async function endpoint(req: NextApiRequest, res: NextApiResponse) {

  const subscriptionService = SubscriptionService();
  const authService = AuthService();
  const treatError = TreatError();

  await cors(req, res);

  if(!await authService.checkAuthentication(req)){
    return res.status(401).send(await treatError.general('Usuário não autorizado.'))
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


                subscription = { ...subscription, user: { id: currentUserId as string } };

                await subscriptionService.save(subscription);
        
                let response: APIResponse = {
                msg: "Inscrição salva com sucesso!",
                result: subscription
                }
        
                res.status(200).json(response);
            }catch(e){
                return res.status(400).json(treatError.general("Erro ao salvar usuário"));
                console.log(e);
            }

            break;
    case "GET":

      let getResponse: APIResponse = {
        msg: "",
      };
      if (req.query.processID) {

        result: null
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
