"use strict";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports = {
  async generateHash(password) {
    return await bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
  },

  async validPassword(givenPassword, password) {
    return await bcrypt.compare(givenPassword, password);
  },

  async generateAccessToken(user) {
    return await jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
  },
};
