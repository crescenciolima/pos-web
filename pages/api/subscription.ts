import { NextApiRequest, NextApiResponse } from 'next'
import UserService from '../../lib/user.service'
import FileUploadService from '../../lib/upload.service';
import { StoragePaths } from '../../lib/storage-path';
import multer from 'multer';
import initMiddleware from '../../lib/init-middleware'
import { NextApiRequestWithFormData, BlobCorrected } from '../../utils/types-util';
import { User } from '../../models/user';
import { APIResponse } from '../../models/api-response';
import Cors from 'cors'
import AuthService from '../../lib/auth.service';
import FirebaseMessage from '../../utils/firebase-message-util';
import TreatError from '../../lib/treat-error.service';
import SubscriptionService from '../../lib/subscription.service';
import { Subscription } from '../../models/subscription';
import StudentService from '../../lib/student.service';
import { Student } from '../../models/student';

const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
      // Only allow requests with GET, POST and OPTIONS
      methods: ['GET', 'POST', 'OPTIONS'],
  })
)

export default async (req: NextApiRequest, res: NextApiResponse) => {

    const subscriptionService = SubscriptionService();
    const studentService = StudentService();
    const authService = AuthService();
    const treatError = TreatError();

    await cors(req, res);

    if (!await authService.checkAuthentication(req)){
        return res.status(401).send(await treatError.general('Usuário não autorizado.'));
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
                console.log(e);
                return res.status(400).json(treatError.general("Erro ao salvar usuário"));
            }

            break;

        case "GET":

            let getResponse: APIResponse = {
                msg: "",
                result: null
            };

            if (req.query.id) {
                const user = await subscriptionService.getById(req.query.id);
                getResponse.result = user;
            } else {
                const userList = await subscriptionService.getAll();
                getResponse.result = userList;
            }

            res.status(200).json(getResponse);
            break

        case "DELETE":
            res.status(405);
        default:
            res.status(405);
        break;
    }

}


