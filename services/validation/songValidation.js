"use strict";

const Joi = require("joi");
const { errorResponseData } = require("../responses");

module.exports = {
  addSongSchema(body, res) {
    const Schema = Joi.object({
      songname: Joi.string().min(3).max(30).required(),
      genres: Joi.array().items(Joi.number()).required(),
    });

    const validationResult = Schema.validate(body);

    if (validationResult.error) {
      return errorResponseData(
        res,
        "Error while validating values",
        validationResult.error.details
      );
    }
  },
};
