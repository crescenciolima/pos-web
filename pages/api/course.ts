import { NextApiRequest, NextApiResponse } from 'next'
import CourseService from '../../lib/course.service';
import AuthService from '../../lib/auth.service';
import { Course } from '../../models/course';
import Cors from 'cors';
import initMiddleware from '../../lib/init-middleware';
import { authAdmin } from "./../../utils/firebase-admin";

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

    await cors(req, res);

    if (req.method === 'POST') {
        if (!await authService.checkAuthentication()){
            return res.status(401).send({ message: 'Unauthorized' });
        }

        const {id, name, description} = req.body;

        let course: Course = {
            name: name,
            description: description
        }
        console.log(course)

        if(id){
            course.id = id;
            await courseService.update(course, req.headers.authorization);
        }else{
            await courseService.save(course, req.headers.authorization);
        }

        const courseList = await courseService.getAll();

        res.status(200).json(courseList);

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