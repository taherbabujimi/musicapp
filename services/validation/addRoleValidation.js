"use strict";

const Joi = require("joi");
const { errorResponseData } = require("../responses");
const { messages } = require("../messages");

module.exports = {
  addRoleValidation(body, res) {
    const Schema = Joi.object({
      role_name: Joi.string().min(3).max(30).required(),
      permissions: Joi.array().min(1).items(Joi.number().required()).required(),
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
