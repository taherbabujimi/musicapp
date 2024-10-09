"use strict";

const { Model, BelongsTo } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Genre extends Model {
    static associate(models) {
      this.belongsToMany(models.Song, { through: "Song_Genre" });
    }
  }

  Genre.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      genrename: {
        type: DataTypes.INTEGER,
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
      modelName: "Genre",
      tableName: "generes",
    }
  );
  return Genre;
};
