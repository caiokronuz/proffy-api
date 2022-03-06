import Knex from 'knex';

export async function up(knex: Knex){

    //Criando os horarios de aula

    return knex.schema.createTable('class_schedule', table => {
        table.increments('id').primary();
        
        table.integer('week_day').notNullable(); //Dia da semana
        table.integer('from').notNullable(); // Horario inicio
        table.integer('to').notNullable(); // Horário fim                                                                                                 fim

        //Relacionando o horário de aula com a aula
        table.integer('class_id') //ID da aula (chave estrangeira)
            .notNullable()
            .references('id')
            .inTable('classes')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
    });
}

export async function down(knex: Knex){
    return knex.schema.dropTable('class_schedule');
}