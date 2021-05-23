import { NextApiRequest, NextApiResponse } from 'next'
import CourseService from '../../../lib/course.service';
import { Course } from '../../../models/course';
import Cors from 'cors'
import initMiddleware from '../../../lib/init-middleware'
import AuthService from '../../../lib/auth.service';
import { User } from '../../../models/user';
import { APIResponse } from '../../../models/api-response';

const cors = initMiddleware(
    // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
    Cors({
        // Only allow requests with GET, POST and OPTIONS
        methods: ['GET', 'POST', 'OPTIONS'],
    })
)

export default async (req: NextApiRequest, res: NextApiResponse) => {
    //Create a firestore course service
    const authService = AuthService();

    await cors(req, res);

    if (req.method === 'POST') {
        // Process a POST request

        //Getting all data from the request body
        const {email, password} = req.body;
        console.log(req.body)
        console.log(email, password)

        //Instantiating a Course
        let user: User = {
            email: email,
            password: password
        }
        console.log(user);

        await authService.signUp(user);

        let response: APIResponse = {
            msg: "Usuário cadastrado com sucesso!",
            result: null
          }
        res.status(200).json(response);

    } else {
        res.status(200).json([]);
    }



}