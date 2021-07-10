import { NextApiRequest, NextApiResponse } from 'next'
import UserService from '../../lib/user.service'
import FileUploadService from '../../lib/upload.service';
import { StoragePaths } from '../../lib/storage-path';
import multer from 'multer';
import initMiddleware from '../../lib/init-middleware'
import { NextApiRequestWithFormData, BlobCorrected } from '../../utils/types-util';
import { User } from '../../models/user';
import { APIResponse } from '../../models/api-response';
import Cors from 'cors'
import AuthService from '../../lib/auth.service';
import FirebaseMessage from '../../utils/firebase-message-util';
import TreatError from '../../lib/treat-error.service';

const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
      // Only allow requests with GET, POST and OPTIONS
      methods: ['GET', 'POST', 'OPTIONS'],
  })
)

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const userService = UserService();
  const authService = AuthService();
  const treatError = TreatError();

  await cors(req, res);

  switch (req.method) {

    case "POST":
      try{
        const id = req.body.id;
        const { name, email, password, type }: User = req.body;
  
        let user: User = {
          name: name,
          email: email,
          password: password,
          type: type
        }

        if (id) {
          user.id = id;
        } else {
          const result: any = await authService.signUp(user);
          
          if(result.error){        
            return res.status(400).json(await treatError.firebase(result));
          }

          user.id = result.id;
          delete user.password;
        }

        await userService.update(user);
  
        let response: APIResponse = {
          msg: "Usuário salvo com sucesso!",
          result: user
        }
  
        res.status(200).json(response);
      }catch(e){
        console.log(e);
        return res.status(400).json(treatError.general("Erro ao salvar usuário"));
      }

      break;

    case "GET":

      let getResponse: APIResponse = {
        msg: "",
        result: null
      };

      if (req.query.id) {
        const user = await userService.getById(req.query.id);
        getResponse.result = user;
      } else {
        const userList = await userService.getAll();
        getResponse.result = userList;
      }

      res.status(200).json(getResponse);
      break

    case "DELETE":
      try{
        let userID = req.query.id.toString();
        const deletedUser = await userService.getById(userID);

        await userService.remove(deletedUser);
        
        const result: any = await authService.removeUser(deletedUser);

        if(result.error){        
          return res.status(400).json(treatError.firebase(result));
        }

        let deleteResponse: APIResponse = {
          msg: "Usuário removido com sucesso!",
          result: {}
        }

        res.status(200).json(deleteResponse);
      }catch(e){
        console.log(e);
        return res.status(400).json(treatError.general("Erro ao salvar remover usuário"));
      }
    default:
      console.log(req.method)
      res.status(405);
      break;
  }

}


