import { NextApiRequest, NextApiResponse } from 'next'
import CourseService from '../../../lib/course.service';
import { Course } from '../../../models/course';
import Cors from 'cors'
import AuthService from '../../../lib/auth.service';
import UserService from '../../../lib/user.service';
import { User } from '../../../models/user';
import { APIResponse } from '../../../models/api-response';
import initMiddleware from '../../../utils/init-middleware';
import { string } from 'yup/lib/locale';
import FirebaseMessage from '../../../utils/firebase-message-util';
import TreatError from '../../../lib/treat-error.service';

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

    if (req.method === 'POST') {
        const {name, email, password, type} = req.body;

        let user: User = {
            name: name,
            email: email,
            password: password,
            type: type,
        }

        let result: any = await authService.signUp(user, res);

        if (!result.error){

            delete user.password;
            
            if(result.id){
                user.id = result.id;
                await userService.update(user);
                user.token = result.token;
            }

            let response: APIResponse = {
                msg: "Usuário cadastrado com sucesso!",
                result: user
            }

            res.status(200).json(response);
        } else {
            const treatError = TreatError();

            const errorMsg = await treatError.firebase(result);

            let response: APIResponse = errorMsg
            
            res.status(401).json(response);
        }

    } else {
        res.status(200).json([]);
    }



}