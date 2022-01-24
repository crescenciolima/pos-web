import { NextApiResponse } from 'next'
import { StoragePaths } from '../../utils/storage-path';
import multer from 'multer';
import initMiddleware from '../../utils/init-middleware'
import { NextApiRequestWithFormData, BlobCorrected } from '../../utils/types-util';
import { Teacher } from '../../models/teacher';
import { APIResponse } from '../../models/api-response';
import Cors from 'cors'
import { Constants } from '../../utils/constants';
import { TeacherService } from '../../lib/teacher.service';
import { AuthService } from '../../lib/auth.service';
import { TreatError } from '../../lib/treat-error.service';
import { FileUploadService } from '../../lib/upload.service';

global.XMLHttpRequest = require('xhr2');
const upload = multer({ limits: { fileSize: Constants.MAX_FILE_SIZE } });
// for parsing multipart/form-data
// note that Multer limits to 1MB file size by default
const multerAny = initMiddleware(
  upload.any()
);

const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
      // Only allow requests with GET, POST and OPTIONS
      methods: ['GET', 'POST', 'OPTIONS'],
  })
)

async function endpoint(req: NextApiRequestWithFormData, res: NextApiResponse) {

  const teacherService = new TeacherService();
  const authService = new AuthService();
  const treatError = new TreatError();

  switch (req.method) {

    case "POST":
      try{
        await multerAny(req, res);

        if(!await authService.checkAuthentication(req)){
          return res.status(401).send(await treatError.message('Usuário não autorizado.'))
        }

        //Extraindo os dados da requisição
        const blob: BlobCorrected = req.files?.length ? req.files[0] : null;
        const { id, name, about, email, phone, photo }: Teacher = req.body;
  
        //Povoando um objeto do tipo Docente com os dados
        const teacher: Teacher = {
          name: name,
          about: about,
          email: email,
          phone: phone,
          photo: blob ? "" : photo
        }
        
        //Verificando se um arquivo foi enviado e se deve sobrescreve-lo
        if(blob){
          const uploadService = new FileUploadService();
          if(id){
            try{
              await uploadService.remove(photo);
            } catch(error){}
            
          }
          //Envia o arquivo usando o serviço de upload
          let url = await uploadService.upload(StoragePaths.TEACHERS, blob, teacher.name);
          teacher.photo = url;
        }
        
        //Verifica se os dados enviados possuiam um ID, se sim, é uma atualização, se não um cadastro
        if(id){
          teacher.id = id;
          await teacherService.update(teacher);
        }else{
          await teacherService.save(teacher);
        }
        
        //Cria e devolve a resposta ao cliente
        let response: APIResponse = {
          msg: "Docente salvo com sucesso!",
          result: teacher
        }
  
        res.status(200).json(response);
      }catch(e){
        //console.log(e);
        return res.json({error: "error"});
      }

      break;

    case "GET":

      let getResponse: APIResponse = {
        msg: "",
        result: null
      };

      if (req.query.id) {
        const teacher = await teacherService.getById(req.query.id);
        getResponse.result = teacher;
      } else {
        const docenteList = await teacherService.getAll();
        getResponse.result = docenteList;
      }

      res.status(200).json(getResponse);
      break

    case "DELETE":
      if(!await authService.checkAuthentication(req)){
        return res.status(401).send(await treatError.message('Usuário não autorizado.'))
      }
      
      let teacherID = req.query.id.toString();
      const deletedTeacher = await teacherService.getById(teacherID);
      let uploadService = new FileUploadService();
      await uploadService.remove(deletedTeacher.photo);

      await teacherService.remove(teacherID);

      let deleteResponse: APIResponse = {
        msg: "Docente removido com sucesso!",
        result: {}
      }

      res.status(200).json(deleteResponse);

    default:
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

