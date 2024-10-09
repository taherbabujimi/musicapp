const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Song_Genre extends Model {}

  Song_Genre.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
      },
      song_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      genre_id: {
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
      modelName: "Song_Genre",
      tableName: "songs_generes",
    }
  );
  return Song_Genre;
};
