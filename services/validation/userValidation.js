"use strict";

const Joi = require("joi");
const { errorResponseData } = require("../responses");

module.exports = {
  registerUserSchema(req, res) {
    const schema = Joi.object({
      username: Joi.string().min(3).max(30).required(),
      email: Joi.string().email(),
      password: Joi.string().required().min(3).max(30),
      usertype: Joi.string().valid("user", "admin"),
    });

    const validationResult = schema.validate(req.body);

    // console.log(validationResult);

    if (validationResult.error) {
      return errorResponseData(
        res,
        "Error while validating values",
        validationResult.error.details
      );
    }
  },

  userLoginSchema(req, res) {
    const Schema = Joi.object({
      username: Joi.string().required().min(3).max(30),
      password: Joi.string().required().min(3).max(30),
    });

    const validationResult = Schema.validate(req.body);

    if (validationResult.error) {
      return errorResponseData(
        res,
        "Error while validating values.",
        validationResult.error.details
      );
    }
  },
};
