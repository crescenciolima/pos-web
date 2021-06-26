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

  await cors(req, res);

  switch (req.method) {

    case "POST":
      try{
        console.log(req.body);
        const id = req.body.id;
        const { name, email, password }: User = req.body;
  
        const user: User = {
          name: name,
          email: email,
          password: password
        }

        if(id){
          user.id = id;
          await userService.update(user);
        }else{
          await userService.save(user);
          await authService.signUp(user);
        }
  
        let response: APIResponse = {
          msg: "Usuário salvo com sucesso!",
          result: user
        }
  
        res.status(200).json(response);
      }catch(e){
        console.log(e);
        return res.json({error: "error"});
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
      let userID = req.query.id.toString();
      const deletedUser = await userService.getById(userID);

      await userService.remove(deletedUser);
      await authService.removeUser(deletedUser);

      let deleteResponse: APIResponse = {
        msg: "Usuário removido com sucesso!",
        result: {}
      }

      res.status(200).json(deleteResponse);

    default:
      console.log(req.method)
      res.status(405);
      break;
  }

}


