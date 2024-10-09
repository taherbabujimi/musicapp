"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("songs", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      songname: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      created_by: {
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
    await queryInterface.dropTable("songs");
  },
};
