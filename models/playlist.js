"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Playlist extends Model {
    static associate(models) {
      this.belongsToMany(models.Song, {
        through: "songs_playlists",
        foreignKey: "playlist_id",
        otherKey: "song_id",
      });
      this.belongsTo(models.User, {
        foreignKey: { field: "created_By" },
      });
    }
  }

  Playlist.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      playlistname: {
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
      modelName: "Playlist",
      tableName: "playlists",
      timestamps: true,
    }
  );
  return Playlist;
};
