"use strict";
const { Model } = require("sequelize");
const { USER_TYPE } = require("../services/constants");
const USERTYPE = Object.values(USER_TYPE);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasMany(models.Song, { foreignKey: { field: "created_by" } });
      this.hasMany(models.Genre, { foreignKey: { field: "created_by" } });
      this.hasMany(models.Playlist, { foreignKey: { field: "created_by" } });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      usertype: {
        type: DataTypes.ENUM(USERTYPE),
        allowNull: false,
      },
      user_genre_preference: {
        type: DataTypes.JSON,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
    }
  );

  User.beforeCreate(async (user, options) => {
    return await bcrypt
      .hash(user.password, 10)
      .then((hash) => {
        user.password = hash;
      })
      .catch((err) => {
        throw new Error();
      });
  });

  User.prototype.generateHash = async (password) => {
    return await bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
  };

  User.prototype.validPassword = async (password) => {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.generateAccessToken = function () {
    return jwt.sign({
      id: this.id,
      username: this.username,
      email: this.email,
    });
  };

  return User;
};
