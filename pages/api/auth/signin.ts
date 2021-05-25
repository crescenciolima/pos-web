import { NextApiRequest, NextApiResponse } from 'next'
import CourseService from '../../../lib/course.service';
import { Course } from '../../../models/course';
import Cors from 'cors'
import initMiddleware from '../../../lib/init-middleware'
import { APIResponse } from '../../../models/api-response';
import AuthService from '../../../lib/auth.service';
import { User } from '../../../models/user';

const cors = initMiddleware(
    // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
    Cors({
        // Only allow requests with GET, POST and OPTIONS
        methods: ['GET', 'POST', 'OPTIONS'],
    })
)

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const authService = AuthService();

    await cors(req, res);

    if (req.method === 'POST') {
        const {email, password} = req.body;

        let user: User = {
            email: email,
            password: password
        }
        console.log(user);

        await authService.signIn(user).then((user) =>{
            let response: APIResponse = {
                msg: "Login efetuado com sucesso!",
                result: user
            }
            res.status(200).json(response);
        });


    } else {
        res.status(200).json([]);
    }



}