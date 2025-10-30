const { Sequelize, DataTypes } = require('sequelize');

// Cria conexão com o banco local
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database/florir.db'
});

// Define o modelo de Post
const Post = sequelize.define('Post', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  summary: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = { sequelize, Post };
