"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Song extends Model {
    static associate(models) {
      this.belongsToMany(models.Genre, { through: "Song_Genre" });
    }
  }

  Song.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      songname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Song",
      tableName: "songs",
    }
  );
  return Song;
};
