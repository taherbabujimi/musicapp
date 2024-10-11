"use strict";

const { USER_TYPE } = require("../services/constants");
const { errorResponseWithoutData } = require("../services/responses");

module.exports = {
  async verifyUsertype(req, res, next) {
    if (req.user.usertype === USER_TYPE.USER) {
      return errorResponseWithoutData(
        res,
        `Only admins can add this data`,
        400
      );
    }

    next();
  },
};
