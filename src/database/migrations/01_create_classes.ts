import Knex from 'knex';

export async function up(knex: Knex){

    //Cria a "Aula"

    return knex.schema.createTable('classes', table =>{
        table.increments('id').primary(); //Id
        table.string('subject').notNullable(); //Matéria
        table.decimal('cost').notNullable(); //Valor da hora

        //Relacionando as informações da aula ao professor
        table.integer('user_id') //Id do professor (chave estrangeira)
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('CASCADE')
    });
}

export async function down(knex: Knex){
    return knex.schema.dropTable('classes');
}