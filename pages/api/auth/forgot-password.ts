import { NextApiRequest, NextApiResponse } from 'next'
import CourseService from '../../../lib/course.service';
import { Course } from '../../../models/course';
import Cors from 'cors'
import { APIResponse } from '../../../models/api-response';
import AuthService from '../../../lib/auth.service';
import { User } from '../../../models/user';
import UserService from '../../../lib/user.service';
import TreatError from '../../../lib/treat-error.service';
import initMiddleware from '../../../utils/init-middleware';

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
    const treatError = TreatError();

    await cors(req, res);

    if (req.method === 'POST') {
        const { email } = req.body;

        let user: User = {
            email: email
        }

        const result: any = await authService.forgotPassword(user);
          
        if(result.error){        
          return res.status(400).json(await treatError.firebase(result));
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