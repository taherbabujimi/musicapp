"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Song extends Model {
    static associate(models) {
      this.belongsToMany(models.Genre, {
        through: "songs_genres",
        foreignKey: "song_id",
        otherKey: "genre_id",
      });
      this.belongsToMany(models.Playlist, {
        through: "songs_playlists",
        foreignKey: "song_id",
        otherKey: "playlist_id",
      });
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
