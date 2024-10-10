"use strict";

const Joi = require("joi");
const { errorResponseData } = require("../responses");

module.exports = {
  addGenreSchema(req, res) {
    const Schema = Joi.object({
      genrename: Joi.string().min(3).max(30).required(),
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
