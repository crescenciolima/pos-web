import { NextApiRequest, NextApiResponse } from 'next'
import initMiddleware from '../../utils/init-middleware'
import { User } from '../../models/user';
import { APIResponse } from '../../models/api-response';
import Cors from 'cors'
import { UserService } from '../../lib/user.service';
import { AuthService } from '../../lib/auth.service';
import { TreatError } from '../../lib/treat-error.service';

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
  const treatError = new TreatError();

  await cors(req, res);

  switch (req.method) {

    case "POST":
      try{
        const { id, name, email, password, type }: User = req.body;
  
        const currentUserId = await authService.checkAuthentication(req);

        if (!currentUserId || currentUserId !== id){
          return res.status(401).send(await treatError.message('Usuário não autorizado.'));
        }

        let user: User = {
          id: id,
          name: name,
          email: email,
          password: password,
          type: type
        }

        if(user.password !== ''){
          await authService.updateUser(user);
        }

        delete user.password;
        await userService.update(user);
  
        let response: APIResponse = {
          msg: "Usuário salvo com sucesso!",
          result: user
        }
  
        res.status(200).json(response);
      }catch(e){
        return res.status(400).json(await treatError.message("Erro ao salvar usuário"));
      }

      break;
    default:
      res.status(405);
      break;
  }

}


