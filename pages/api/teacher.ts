import { NextApiRequest, NextApiResponse } from 'next'
import TeacherService from '../../lib/teacher.service'
import FileUploadService from '../../lib/upload.service';
import { StoragePaths } from '../../lib/storage-path';
import storage from "../../utils/storage-util";
import multer from 'multer';
import initMiddleware from '../../lib/init-middleware'
import { NextApiRequestWithFormData, BlobCorrected } from '../../utils/types-util';
import { Teacher } from '../../models/teacher';

global.XMLHttpRequest = require('xhr2');
const upload = multer();

// for parsing multipart/form-data
// note that Multer limits to 1MB file size by default
const multerAny = initMiddleware(
  upload.any()
);


async function endpoint(req: NextApiRequestWithFormData, res: NextApiResponse) {

  const teacherService = TeacherService();

  switch (req.method) {

    case "POST":

      await multerAny(req, res);

      // This operation expects a single file upload. Edit as needed.
      if (!req.files?.length || req.files.length > 1) {
        res.statusCode = 400;
        res.end();
        return;
      }

      const blob: BlobCorrected = req.files[0];
      const {name, about, email, phone}: Teacher = req.body;

      const teacher:Teacher = {
        name:name,
        about:about,
        email:email,
        phone:phone,
        photo: ""
      }

      const uploadService = FileUploadService();
      let url = await uploadService.upload(StoragePaths.TEACHERS, blob, teacher.name);

      teacher.photo = url;

     await teacherService.save(teacher)

      res.status(200).json({ teacher: teacher });
      break;

    case "GET":

      const docenteList = await teacherService.getAll();

      res.status(200).json(docenteList);
      break;

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

