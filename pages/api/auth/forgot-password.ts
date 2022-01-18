import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import { APIResponse } from '../../../models/api-response';
import { User } from '../../../models/user';
import initMiddleware from '../../../utils/init-middleware';
import { AuthService } from '../../../lib/auth.service';
import { TreatError } from '../../../lib/treat-error.service';

const cors = initMiddleware(
    // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
    Cors({
        // Only allow requests with GET, POST and OPTIONS
        methods: ['GET', 'POST', 'OPTIONS'],
    })
)

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const authService = new AuthService();
    const treatError = new TreatError();

    await cors(req, res);

    if (req.method === 'POST') {
        const { email } = req.body;

        let user: User = {
            email: email
        }

        const result: any = await authService.forgotPassword(user);
          
        if(result.error){        
          return res.status(400).json(await treatError.message(result));
        }
        
        let response: APIResponse = {
            msg: "E-mail de recuperação de senha enviado!",
            result: {}
        }
        res.status(200).json(response);

    } else {
        res.status(200).json([]);
    }

}