"use strict";

const bcrypt = require("bcrypt");

const generateHash = async (password) => {
  return await bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

module.exports = {
  async up(queryInterface) {
    const hashedPassword = await generateHash(process.env.ADMIN_PASSWORD);
    await queryInterface.bulkInsert(
      "users",
      [
        {
          username: "Taher Babuji",
          email: "taher@gmail.com",
          password: hashedPassword,
          usertype: "superAdmin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
