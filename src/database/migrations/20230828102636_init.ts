import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable("users", (table) => {
      table.increments("id");
      table.string("firstName").notNullable();
      table.string("lastName").notNullable();
      table.string("email").notNullable().unique();
      table.string("phoneNumber").notNullable().unique();
      table.string("password").notNullable();
      table.string("status");
      table.timestamps(true, true, true);
    })
    .createTable("wallets", (table) => {
      table.increments("id");
      table.string("currency").notNullable();
      table.integer("userId").unsigned().notNullable();
      table.foreign("userId").references("users.id");
      table.float("balance").defaultTo(0);
      table.timestamps(true, true, true);
    })
    .createTable("transactions", (table) => {
      table.increments("id");
      table.string("type").notNullable();
      table.float("amount").notNullable();
      table.string("status").notNullable();
      table.string("operation").notNullable();
      table.string("reference").notNullable();
      table.integer("userId").unsigned().notNullable().index();
      table.foreign("userId").references("users.id");
      table.jsonb("meta");
      table.jsonb("serverMeta");
      table.timestamps(true, true, true);
    })
    .createTable("emails", (table) => {
      table.increments("id");
      table.string("template").notNullable();
      table.jsonb("meta");
      table.string("senderEmail").notNullable();
      table.string("receiverEmail").notNullable();
      table.string("subject").notNullable();
      table.string("replyTo");
      table.boolean("delivered").defaultTo(false);
      table.string("error");
      table.timestamps(true, true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTable("emails")
    .dropTable("transactions")
    .dropTable("wallets")
    .dropTable("users");
}
