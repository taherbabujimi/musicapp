"use strict";

const { USER_TYPE } = require("../services/constants");
const { messages } = require("../services/messages");
const { errorResponseWithoutData } = require("../services/responses");

module.exports = {
  async verifyAdminUsertype(req, res, next) {
    if (req.user.usertype === USER_TYPE.USER) {
      return errorResponseWithoutData(res, messages.adminAccess, 400);
    }

    next();
  },
};
