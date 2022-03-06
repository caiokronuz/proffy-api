import { Request, Response } from 'express';
import db from '../database/connection';
import convertHourToMinute from '../utils/convertHourToMinutes';

interface ScheduleItem {
    week_day: number;
    from: string;
    to: string;
}

export default class ClassesController {
    //GET
    async index(req: Request, res: Response) {

        //Aqui é onde buscamos as aulas

        const filters = req.query; //Recebe os filtros

        /*
        Ex: ?subject=Ciências&week_day=1&time=01:33
        */

        //Separa o "subject" (Matéria), "week_day(Dia da semana) e "time"(Horario)
        const subject = filters.subject as string;
        const week_day = filters.week_day as string;
        const time = filters.time as string;

        if (!filters.subject && !filters.week_day && !filters.time) {
            /*
                SELECT id, subject, cost, user_id, name, avatar, bio, whatsapp
                FROM users INNER JOIN classes ON users.id = classes.user_id;
            */

            /*const classes = await db('users')
                .select('users.id', 'subject', 'cost', 'user_id', 'name', 'avatar', 'bio', 'whatsapp')
                .join('classes', 'users.id', '=', 'classes.user_id');
            */

            const classes = await db('classes')
                .join('users', 'classes.user_id', '=', 'users.id')
                .select(['classes.*', 'users.*']);

            return res.json(classes);
        }

        //Se tiver filtro, mas tiver faltando um dos filtros
        if (!subject || !week_day || !time) {
            //tem materia
            if (subject) {
                if (week_day) { //tem materia e dia da semana
                    const classes = await db('classes')
                        .whereExists(function () {
                            this.select('class_schedule.*')
                                .from('class_schedule')
                                .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                                .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
                        })
                        .where('classes.subject', '=', subject as string)
                        .join('users', 'classes.user_id', '=', 'users.id')
                        .select(['classes.*', 'users.*']);
                    return res.json(classes);
                } else if (time) { //tem matéria e horario
                    const timeInMinutes = convertHourToMinute(time);
                    const classes = await db('classes')
                        .whereExists(function () {
                            this.select('class_schedule.*')
                                .from('class_schedule')
                                .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                                .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                                .whereRaw('`class_schedule`.`to` > ?? ', [timeInMinutes])
                        })
                        .where('classes.subject', '=', subject as string)
                        .join('users', 'classes.user_id', '=', 'users.id')
                        .select(['classes.*', 'users.*']);
                    return res.json(classes);
                } else { // tem so materia
                    const classes = await db('classes')
                        .whereExists(function () {
                            this.select('class_schedule.*')
                                .from('class_schedule')
                                .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                        })
                        .where('classes.subject', '=', subject as string)
                        .join('users', 'classes.user_id', '=', 'users.id')
                        .select(['classes.*', 'users.*']);
                    return res.json(classes);
                }
            } else if (week_day) { //tem dia da semana
                if (time) { //tem dia da semana e horario
                    const timeInMinutes = convertHourToMinute(time);
                    const classes = await db('classes')
                        .whereExists(function () {
                            this.select('class_schedule.*')
                                .from('class_schedule')
                                .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                                .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
                                .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                                .whereRaw('`class_schedule`.`to` > ?? ', [timeInMinutes])
                        })
                        .join('users', 'classes.user_id', '=', 'users.id')
                        .select(['classes.*', 'users.*']);
                    return res.json(classes);
                } else {// tem só dia da semana
                    const classes = await db('classes')
                        .whereExists(function () {
                            this.select('class_schedule.*')
                                .from('class_schedule')
                                .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                                .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
                        })
                        .join('users', 'classes.user_id', '=', 'users.id')
                        .select(['classes.*', 'users.*']);
                    return res.json(classes);
                }
            } else if (time) { //tem somente o horario
                const timeInMinutes = convertHourToMinute(time);
                const classes = await db('classes')
                    .whereExists(function () {
                        this.select('class_schedule.*')
                            .from('class_schedule')
                            .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                            .whereRaw('`class_schedule`.`to` > ?? ', [timeInMinutes])
                    })
                    .join('users', 'classes.user_id', '=', 'users.id')
                    .select(['classes.*', 'users.*']);
                return res.json(classes);
            }
        }

        //A partir de agora é feita a pesquina no banco de dados
        
        const timeInMinutes = convertHourToMinute(time);

        const classes = await db('classes')
            .whereExists(function () {
                this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
                    .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                    .whereRaw('`class_schedule`.`to` > ?? ', [timeInMinutes])
            })
            .where('classes.subject', '=', subject as string)
            .join('users', 'classes.user_id', '=', 'users.id')
            .select(['classes.*', 'users.*']);
        return res.json(classes);

    }

    //POST
    async create(req: Request, res: Response) {

        //Aqui é onde criamos as aulas

        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = req.body;

        const trx = await db.transaction(); //Abre a conexão com o banco de dados

        try {

            /*
                Na tabela users insere:
                    nome, avatar, whatsapp e bio
            */

            const insertedUsersIds = await trx('users').insert({
                name,
                avatar,
                whatsapp,
                bio,
            });

            const user_id = insertedUsersIds[0];
            //Pega o id do campo que acabamos de criar na tabela de users

            /*
                Cria a classe adicionando os campos:
                    subject (matéria), cost(valor da hora)
                E cria a relação da classe com o user(professor), adicionando o id do professor como
                chave estrangeira no campo.
            */
            const insertedClassesIds = await trx('classes').insert({
                subject,
                cost,
                user_id,
            });

            const class_id = insertedClassesIds[0];
            //Pega o id do campo que acabamos de criar na tabela de classes


            /*
                Cria a tabela com os horarios de aula adicionando os campos:
                    week_day(dia da semana), from(horario inicio), to(horario final)
                E também cria a relação com a classe(aula) adicionando o id da aula no campo como
                chave estrangeira.
            */
            const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
                //Aqui ele retorna todos os horarios que o professor cadastrou (pode ser apenas 1 ou vários)
                return {
                    class_id,
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinute(scheduleItem.from),
                    to: convertHourToMinute(scheduleItem.to),
                };
            });

            //Pega a array de horarios insere na tabela.
            await trx('class_schedule').insert(classSchedule);

            //Fecha conexão com o banco de dados
            await trx.commit();

            //Retorna o status 201 (sucesso)
            return res.status(201).send();

        } catch (err) {
            console.log(err);

            await trx.rollback();

            return res.status(400).json({
                error: 'Unexpected error white creating new class'
            });
        }
    }
}