import { NextApiRequest, NextApiResponse } from 'next'
import TeacherService from '../../lib/teacher.service'
import Formidable from 'formidable';
import FileUploadService from '../../lib/upload.service';
import { StoragePaths } from '../../lib/storage-path';
import storage from "../../utils/storage-util";

async function endpoint(req: NextApiRequest, res: NextApiResponse) {


  switch (req.method) {

    case "POST":

      const data = await new Promise(async (resolve, reject) => {
        const form = new Formidable.IncomingForm({ keepExtensions: true });
        await form.parse(req, async (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });
      // console.log(data['fields'].user);
      // console.log(data['files'].file);

      const file: File = data['files'].file;

      try {
        let list = await storage.ref().child("docentes").list();
        console.log(list)
      } catch (err) {
        console.log(err)
      }

      setTimeout(() => { res.status(200).json({ oi: 'oi' }); }, 5000);


      break;

    case "GET":
      const teacherService = TeacherService();

      const docenteList = await teacherService.getAll();

      res.status(200).json(docenteList);
    default:
      console.log(req.method)
      res.status(405);
      break;
  }

}


export const config = {
  api: {
    bodyParser: false,
  },
}

export default endpoint;

