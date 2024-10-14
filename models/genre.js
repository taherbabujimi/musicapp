"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Genre extends Model {
    static associate(models) {
      this.belongsToMany(models.Song, {
        through: "songs_genres",
        foreignKey: "genre_id",
        otherKey: "song_id",
      });
      this.belongsTo(models.User, {
        foreignKey: { field: "created_by" },
      });
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
      modelName: "Genre",
      tableName: "genres",
      timestamps: true,
    }
  );
  return Genre;
};
