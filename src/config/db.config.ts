import * as dotenv from "dotenv";
import env from "./env.config";

dotenv.config();

export const dbConfig = {
  config: {
    client: "mysql",
    connection: env.dbUrl,
    migrations: {
      directory: "../database/migrations/",
      tableName: "migrations",
    },
  },
};
