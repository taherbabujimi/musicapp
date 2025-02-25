"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "permissions",
      [
        {
          permission_name: "add song",
          permission: "add_song",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          permission_name: "delete song",
          permission: "delete_song",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          permission_name: "add genre",
          permission: "add_genre",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          permission_name: "delete genre",
          permission: "delete_genre",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("permissions", null, {});
  },
};
