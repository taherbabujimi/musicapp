"use strict";

const { PERMISSION } = require("../services/constants");
const PERMISSIONS = Object.values(PERMISSION);

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("permissions", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      permission_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      permission: {
        type: Sequelize.ENUM(PERMISSIONS),
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
    await queryInterface.dropTable("permissions");
  },
};
