"use strict";

const jwt = require("jsonwebtoken");
const {
  errorResponseWithoutData,
  errorResponseData,
} = require("../services/responses");
const Models = require("../models/index");

module.exports = {
  async verifyJWT(req, res, next) {
    try {
      const token = req.header("Authorization");

      if (!token) {
        return errorResponseWithoutData(res, "Unauthorized request", 400);
      }

      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await Models.User.findByPk(decodedToken.id);

      if (!user) {
        return errorResponseWithoutData(res, "Invalid access token", 400);
      }

      req.user = user;

      next();
    } catch (error) {
      return errorResponseData(res, "Invalid access token", error);
    }
  },
};
