import { Sequelize } from "sequelize";

// create sequelize intance
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5, // max connection in pool
      min: 0,
      acquire: 30000, // maximum time a pool will try to get connection before throwing an error
      idle: 10000, // maximum idle connection time
    },
    dialectOptions: {
      // this options are passed directly to connection library (pg as sequelize is connecting to postgres) to configure low level db connections
      ssl:
        process.env.DB_SSL === "true"
          ? {
              require: true, // forces connection to be ssl, if the db server (aws, azure) does not support ssl connection will fail
              rejectUnauthorized: false, //! production true to prevent man in the middle attack, local env don't care
            }
          : false,
    },
  }
);

export default sequelize;
