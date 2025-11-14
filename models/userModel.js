const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("./database");
const bcrypt = require("bcrypt");

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
},
{
  timestamps: true
});

// antes de salvar, criar hash
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

module.exports = { User };
