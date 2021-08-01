import { NextApiRequest, NextApiResponse } from 'next'
import CourseService from '../../lib/course.service';
import { Course } from '../../models/course';
import Cors from 'cors'
import initMiddleware from '../../lib/init-middleware'

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
        // Process a POST request

        //Getting all data from the request body
        const {id, name, description, coordName, coordMail, coordPhone} = req.body;
        console.log(req.body)

        //Instantiating a Course
        let course: Course = {
            name: name,
            description: description,
            coordName: coordName,
            coordMail: coordMail,
            coordPhone: coordPhone
        }
        console.log(course)

        //If has a ID then update the data
        if(id){
            course.id = id;
            await courseService.update(course);
        }else{ //Else, save a new course
            await courseService.save(course);
        }

        //Getting all Courses 
        const courseList = await courseService.getAll();

        //Sending the response
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