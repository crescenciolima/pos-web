import { NextApiRequest, NextApiResponse } from 'next'
import { APIResponse } from '../../models/api-response';
import SubscriptionService from '../../lib/subscription.service';
import { Subscription } from '../../models/subscription/subscription';
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

  if (!await authService.checkAuthentication(req)) {
    return res.status(401).send(await treatError.general('Usuário não autorizado.'))
  }

  const authorization = req.headers.authorization;

  switch (req.method) {

    case "POST":
      try {
        const subscriptionList = req.body.subscriptionList;
        const {isTest, isInterview} = req.body;


        if (subscriptionList) {
          for (let subscription of subscriptionList) {
            await subscriptionService.update(subscription);
          }
        }

        let response: APIResponse = {
          msg: "Inscrições salvas com sucesso!",
          result: subscriptionList
        }

        res.status(200).json(response);
      } catch (e) {
        console.log(e)
        return res.status(400).json(treatError.general("Erro ao salvar usuário"));
      }

      break;
    case "GET":


      break

    case "DELETE":

      break;

    default:
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
