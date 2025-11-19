const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require("./database");

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
  },

  category: {                        // <-- ADICIONAR
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "geral"
  }
});

module.exports = { sequelize, Post };
