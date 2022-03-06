import Knex from 'knex';

export async function up(knex: Knex){

    //Cria o professor 

    return knex.schema.createTable('users', table => {
        table.increments('id').primary(); 
        table.string('name').notNullable(); //Nome
        table.string('avatar').notNullable(); //Link da foto
        table.string('whatsapp').notNullable(); //Número whatsapp
        table.string('bio').notNullable(); //Sobre
    });
}

export async function down(knex: Knex){
    return knex.schema.dropTable('users');
}