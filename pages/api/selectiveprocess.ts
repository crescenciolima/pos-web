import { NextApiRequest, NextApiResponse } from 'next'
import { APIResponse } from '../../models/api-response';
import { SelectiveProcess } from '../../models/subscription-process/selective-process';
import { v4 as uuidv4 } from 'uuid';
import Cors from 'cors'
import initMiddleware from '../../utils/init-middleware';
import { SelectiveProcessService } from '../../lib/selectiveprocess.service';
import { AuthService } from '../../lib/auth.service';
import { TreatError } from '../../lib/treat-error.service';

const cors = initMiddleware(
  Cors({
      methods: ['GET', 'POST', 'OPTIONS'],
  })
)

async function endpoint(req: NextApiRequest, res: NextApiResponse) {

  await cors(req, res);

  const selectiveProcessService = new SelectiveProcessService();
  const authService = new AuthService();
  const treatError = new TreatError();

  switch (req.method) {

    case "POST":
      try {
        if(!await authService.checkAuthentication(req)){
          return res.status(401).send(await treatError.message('Usuário não autorizado.'))
        }
        // await multerAny(req, res);

        let response: APIResponse = {
          msg: "Processo seletivo salvo com sucesso!",
          result: null
        }
        const body = await req.body;

        if (!body.id) {
          //New Process

          const { title, creationDate, state }: SelectiveProcess = body

          const newProcess: SelectiveProcess = {
            title: title,
            creationDate: creationDate,
            state: state,
            numberPlaces: 0,
            reservedPlaces: [
              { name: "Servidores do IFBA", numberPlaces: 0, uuid: uuidv4() },
              { name: "Pessoas com Deficiência", numberPlaces: 0, uuid: uuidv4() },
              { name: "Políticas de Ações Afirmativas", numberPlaces: 0, uuid: uuidv4() },
            ]
          }

          newProcess.id = (await selectiveProcessService.save(newProcess)).id;

          response.result = newProcess;
        } else {
          await selectiveProcessService.update(body);
          response.result = body;
        }

        res.status(200).json(response);
      } catch (e) {
        console.log(e);
        return res.json({ error: "error" });
      }

      break;

    case "GET":

      let getResponse: APIResponse = {
        msg: "",
        result: null
      };
      if (req.query.id) {
        const process = await selectiveProcessService.getById(req.query.id);
        getResponse.result = process;
      } else if (req.query.inconstruction == "true") {
        const process = await selectiveProcessService.getInConstruction();
        getResponse.result = process;
      } else if (req.query.open == "true") {
        const process = await selectiveProcessService.getOpen();
        getResponse.result = process;
      } else  if (req.query.all == "true") {
        const processList = await selectiveProcessService.getAll();
        getResponse.result = processList;
      }

      res.status(200).json(getResponse);
      break

    case "DELETE":
      break;

    default:
      res.status(405);
      break;
  }

}


export const config = {
  api: {
    bodyParser: true,
  },
}

export default endpoint;


