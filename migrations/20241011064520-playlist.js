"use strict";

const { PLAYLIST_TYPE } = require("../services/constants");
const PLAYLISTTYPE = Object.values(PLAYLIST_TYPE);

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("playlists", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      playlistname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      playlist_type: {
        type: Sequelize.ENUM(PLAYLISTTYPE),
        defaultValue: PLAYLIST_TYPE.PUBLIC,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("playlists");
  },
};
