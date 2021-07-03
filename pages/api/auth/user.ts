import { NextApiRequest, NextApiResponse } from 'next'
import CourseService from '../../../lib/course.service';
import { Course } from '../../../models/course';
import Cors from 'cors'
import initMiddleware from '../../../lib/init-middleware'
import { APIResponse } from '../../../models/api-response';
import AuthService from '../../../lib/auth.service';
import { User } from '../../../models/user';
import UserService from '../../../lib/user.service';

const cors = initMiddleware(
    // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
    Cors({
        // Only allow requests with GET, POST and OPTIONS
        methods: ['GET', 'POST', 'OPTIONS'],
    })
)

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const authService = AuthService();
    const userService = UserService();

    await cors(req, res);

    if (req.method === 'GET') {        
        const currentUser = await authService.currentUser();        
        const user = await userService.getById(currentUser.uid);

        let response: APIResponse = {
            msg: "Usuário atual encontrado com sucesso!",
            result: user
        }
        res.status(200).json(response);

    } else {
        res.status(200).json([]);
    }

}