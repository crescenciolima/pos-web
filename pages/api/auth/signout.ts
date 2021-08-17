import { NextApiRequest, NextApiResponse } from 'next'
import CourseService from '../../../lib/course.service';
import { Course } from '../../../models/course';
import Cors from 'cors'
import initMiddleware from '../../../lib/init-middleware'
import { APIResponse } from '../../../models/api-response';
import AuthService from '../../../lib/auth.service';
import { User } from '../../../models/user';

const cors = initMiddleware(
    Cors({
        methods: ['GET', 'POST', 'OPTIONS'],
    })
)

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const authService = AuthService();

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