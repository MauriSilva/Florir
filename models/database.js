const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || "sqlite",
  storage: process.env.DB_PATH || "./database/florir.db",
  logging: false,
  ...(process.env.DB_DIALECT === 'postgres' && {
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }),
  ...(process.env.DB_DIALECT === 'mysql' && {
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'florir'
  })
});

module.exports = sequelize;
