const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("./database");

const Comment = sequelize.define("Comment", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

module.exports = { Comment };
