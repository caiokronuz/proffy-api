import { Request, Response, response} from 'express';
import db from '../database/connection';

export default class ConnectionController {
    //GET
    async index(req: Request, res: Response){
        //Conta quantos campos existem em connections
        const totalConnections = await db('connections').count('* as total');

        //Salva a quantidade de campos existentes
        const { total } = totalConnections[0];

        //Retorna o mesmo
        return res.json({ total });
    }

    //POST
    async create(req: Request, res: Response){
        //Pega o id do professor
        const { user_id } = req.body;

        //Cria um campo e insere o id do professor (o id e o horario da conexão serão inseridos automaticamente)
        await db('connections').insert({
            user_id,
        });

        //Mensagem de sucesso
        return res.status(201).send();
    }
}