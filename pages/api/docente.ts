import { NextApiRequest, NextApiResponse } from 'next'
import DocenteService from '../../lib/docente.service'

export default async (_: NextApiRequest, res: NextApiResponse) => {

  const docenteService = DocenteService();

  const docenteList = await docenteService.getAll();

  res.status(200).json({ list: docenteList });
}