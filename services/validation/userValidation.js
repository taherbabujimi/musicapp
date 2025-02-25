"use strict";

const Joi = require("joi");
const { errorResponseData } = require("../responses");
const { messages } = require("../messages");

module.exports = {
  registerUserSchema(body, res) {
    const schema = Joi.object({
      username: Joi.string().min(3).max(30).required(),
      email: Joi.string().email(),
      password: Joi.string().required().min(3).max(30),
    });

    const validationResult = schema.validate(body);

    if (validationResult.error) {
      return errorResponseData(
        res,
        "Error while validating values",
        validationResult.error.details
      );
    } else {
      return false;
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
        messages.errorValidatingValues,
        validationResult.error.details
      );
    } else {
      return false;
    }
  },
};
