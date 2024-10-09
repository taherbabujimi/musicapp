"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("songs_genres", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      song_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      genre_id: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("songs_genres");
  },
};
