import { NextApiRequest, NextApiResponse } from 'next';
import initMiddleware from '../../utils/init-middleware';
import { User } from '../../models/user';
import { APIResponse } from '../../models/api-response';
import Cors from 'cors'
import TreatError from '../../lib/treat-error.service';
import { UserService } from '../../lib/user.service';
import { AuthService } from '../../lib/auth.service';

const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
      // Only allow requests with GET, POST and OPTIONS
      methods: ['GET', 'POST', 'OPTIONS'],
  })
)

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const userService = new UserService();
  const authService = new AuthService();
  const treatError = TreatError();

  await cors(req, res);

  if (!await authService.checkAuthentication(req)){
    return res.status(401).send(await treatError.general('Usuário não autorizado.'));
}

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
          const result: any = await authService.signUp(user, res);
          
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
        return res.status(400).json(await treatError.general("Erro ao salvar usuário"));
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
      res.status(405);
      break;
  }

}


