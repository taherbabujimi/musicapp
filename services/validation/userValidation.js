"use strict";

const Joi = require("joi");
const { errorResponseData } = require("../responses");
const { USER_TYPE } = require("../constants");
const USERTYPE = Object.values(USER_TYPE);

module.exports = {
  registerUserSchema(body, res) {
    const schema = Joi.object({
      username: Joi.string().min(3).max(30).required(),
      email: Joi.string().email(),
      password: Joi.string().required().min(3).max(30),
      usertype: Joi.string().valid(...USERTYPE),
    });

    const validationResult = schema.validate(body);

    if (validationResult.error) {
      return errorResponseData(
        res,
        "Error while validating values",
        validationResult.error.details
      );
    }
  },

  userLoginSchema(body, res) {
    const Schema = Joi.object({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(3).max(30),
    });

    const validationResult = Schema.validate(body);

    if (validationResult.error) {
      return errorResponseData(
        res,
        "Error while validating values.",
        validationResult.error.details
      );
    }
  },
};
