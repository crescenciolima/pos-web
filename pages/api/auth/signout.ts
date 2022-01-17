import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import { APIResponse } from '../../../models/api-response';
import initMiddleware from '../../../utils/init-middleware';
import { AuthService } from '../../../lib/auth.service';

const cors = initMiddleware(
    Cors({
        methods: ['GET', 'POST', 'OPTIONS'],
    })
)

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const authService = new AuthService();

    await cors(req, res);

    if (req.method === 'GET') {

        await authService.signOut().then((user) =>{
            let response: APIResponse = {
                msg: "Signout efetuado com sucesso!",
                result: user
            }
            res.status(200).json(response);
        });


    } else {
        res.status(200).json([]);
    }



}