import { NextApiRequest, NextApiResponse } from 'next'
import CourseService from '../../../lib/course.service';
import { Course } from '../../../models/course';
import Cors from 'cors'
import initMiddleware from '../../../lib/init-middleware'
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
    const courseService = CourseService();

    await cors(req, res);

    if (req.method === 'POST') {
        let response: APIResponse = {
            msg: "Usuário autenticado com sucesso!",
            result: null
          }
        res.status(200).json(response);

    } else if (req.method === 'GET'){
        //Getting all Courses 
        const courseList = await courseService.getAll();

        //Sending the response
        res.status(200).json(courseList);
    } else {
        // Handle any other HTTP method
        //TO DO
        res.status(200).json([]);
    }



}