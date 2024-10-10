"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Song extends Model {
    static associate(models) {
      this.belongsToMany(models.Genre, { through: "songs_genres" });
      Song.belongsTo(models.User, {
        foreignKey: { field: "created_by" },
      });
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
        references: { model: "users", key: "id" },
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Song",
      tableName: "songs",
      timestamps: true,
    }
  );
  return Song;
};
