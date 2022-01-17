import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import initMiddleware from '../../../utils/init-middleware';
import { APIResponse } from '../../../models/api-response';
import TreatError from '../../../lib/treat-error.service';
import { UserService } from '../../../lib/user.service';
import { AuthService } from '../../../lib/auth.service';

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
    const treatError = TreatError();

    await cors(req, res);

    const authorization = req.headers.authorization;
    if(!await authService.checkAuthentication(req)) {
        return res.status(401).send(await treatError.general('Usuário não autorizado.'))
    }

    if (req.method === 'GET') {        
        const currentUserId = await authService.currentUser(authorization); 
        
        if(!currentUserId){            
          return res.status(401).json(await treatError.general('Usuário atual não encontrado.'));
        }

        try {
            const user = await userService.getById(currentUserId);
            let response: APIResponse = {
                msg: "Usuário atual encontrado com sucesso!",
                result: user
            }
            res.status(200).json(response);
        } catch (e) {
            console.error('Error on get Current User', e)            
            return res.status(401).json(await treatError.general('Erro ao carregar Usuário atual.'));
        }

    } else {
        res.status(200).json([]);
    }

}