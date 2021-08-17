import { NextApiRequest, NextApiResponse } from 'next'
import CourseService from '../../lib/course.service';
import AuthService from '../../lib/auth.service';
import { Course } from '../../models/course';
import Cors from 'cors'
import initMiddleware from '../../utils/init-middleware'
import { authAdmin } from "./../../utils/firebase-admin";
import TreatError from '../../lib/treat-error.service';

const authService = AuthService();
const cors = initMiddleware(
    // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
    Cors({
        // Only allow requests with GET, POST and OPTIONS
        methods: ['GET', 'POST', 'OPTIONS'],
    })
)

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const courseService = CourseService();
    const treatError = TreatError();

    await cors(req, res);

    if (req.method === 'POST') {
        if (!await authService.checkAuthentication(req)){
            return res.status(401).send(await treatError.general('Usuário não autorizado.'));
        }

        //Getting all data from the request body
        const {id, name, description, coordName, coordMail, coordPhone} = req.body;


        let course: Course = {
            name: name,
            description: description,
            coordName: coordName,
            coordMail: coordMail,
            coordPhone: coordPhone
        }

        if(id){
            course.id = id;
            await courseService.update(course);
        }else{
            await courseService.save(course);
        }

        const courseList = await courseService.getAll();

        res.status(200).json(courseList);

    } else if (req.method === 'GET'){
        
        const courseList = await courseService.getAll();

        res.status(200).json(courseList);
    } else {
        res.status(200).json([]);
    }



}