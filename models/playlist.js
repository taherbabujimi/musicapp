"use strict";

const { Model } = require("sequelize");
const { PLAYLIST_TYPE } = require("../services/constants");
const PLAYLISTTYPE = Object.values(PLAYLIST_TYPE);

module.exports = (sequelize, DataTypes) => {
  class Playlist extends Model {
    static associate(models) {
      this.belongsToMany(models.Song, {
        through: "songs_playlists",
        foreignKey: "playlist_id",
        otherKey: "song_id",
      });
      this.belongsToMany(models.User, {
        through: "playlists_likes",
        as: "likedBy",
        foreignKey: "playlist_id",
        otherKey: "user_id",
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
      },
      created_by: {
        type: DataTypes.INTEGER,
        references: { model: "users", key: "id" },
        allowNull: false,
      },
      playlist_type: {
        type: DataTypes.ENUM(PLAYLISTTYPE),
        defaultValue: PLAYLIST_TYPE.PUBLIC,
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
