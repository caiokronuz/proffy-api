import Knex from 'knex';

export async function up(knex: Knex){

    //Criando uma conexão

    return knex.schema.createTable('connections', table => {
        table.increments('id').primary(); // Id

        //Relacionando a conexão ao professor
        table.integer('user_id') //Id do professor (chave estrangeira)
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        
        //Horário que a conexão foi criada
        table.timestamp('created_at')
            .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
            .notNullable();
    });
}

export async function down(knex: Knex){
    return knex.schema.dropTable('connections');
}