import { NextApiRequest, NextApiResponse } from 'next'
import TeacherService from '../../lib/teacher.service'
import Formidable from 'formidable';
import FileUploadService from '../../lib/upload.service';
import { StoragePaths } from '../../lib/storage-path';
import storage from "../../utils/storage-util";
import multer from 'multer';
import initMiddleware from '../../lib/init-middleware'

global.XMLHttpRequest = require('xhr2');
const upload = multer();

// for parsing multipart/form-data
// note that Multer limits to 1MB file size by default
const multerAny = initMiddleware(
    upload.any()
);

type NextApiRequestWithFormData = NextApiRequest & {
    files: any[],
}

type BlobCorrected = Blob & {
    buffer: Buffer,
}

async function endpoint(req: NextApiRequestWithFormData, res: NextApiResponse) {


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

      try {
        //listar: let list = await storage.ref().listAll().then(function(snapshot) {

        let list = await storage.ref().child('teste2.png').put(blob.buffer).then(function(snapshot) {
          console.log('Uploaded a blob or file!');
          console.log(snapshot);

          /*listar: snapshot.items.forEach(function(itemRef) {
            console.log(itemRef);
            // All the items under listRef.
          });*/

        }).catch((err) => {
          console.log(err);
        });
      } catch (err) {
        console.log(err)
      }
      res.status(200).json({oi: "oi"});

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

