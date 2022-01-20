import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import { APIResponse } from '../../../models/api-response';
import { User } from '../../../models/user';
import initMiddleware from '../../../utils/init-middleware';
import { UserService } from '../../../lib/user.service';
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
    const userService = new UserService();
    const treatError = new TreatError();

    await cors(req, res);

    if (req.method === 'POST') {
        const { email, password } = req.body;

        let user: User = {
            email: email,
            password: password
        }

        const result: any = await authService.signIn(user);
        if(result.error){        
          return res.status(400).json(await treatError.message(result));
        }
      
        const userData = await userService.getById(result.id);
        result.type = userData.type;
        result.name = userData.name;

        let response: APIResponse = {
            msg: "Login efetuado com sucesso!",
            result: result
        }
        res.status(200).json(response);

    } else {
        res.status(200).json([]);
    }

}