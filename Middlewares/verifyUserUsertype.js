"use strict";

const { USER_TYPE } = require("../services/constants");
const { messages } = require("../services/messages");
const { errorResponseWithoutData } = require("../services/responses");

module.exports = {
  async verifyUserUsertype(req, res, next) {
    if (req.user.usertype === USER_TYPE.ADMIN) {
      return errorResponseWithoutData(res, messages.userAccess, 400);
    }

    next();
  },
};
