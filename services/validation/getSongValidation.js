"use strict";

const Joi = require("joi");
const { errorResponseData } = require("../responses");
const { messages } = require("../messages");

module.exports = {
  getSongSchema(body, res) {
    const Schema = Joi.object({
      songname: Joi.string().min(3).max(30).required(),
    });

    const validationResult = Schema.validate(body);

    if (validationResult.error) {
      return errorResponseData(res, messages.errorValidatingValues, 400);
    }
  },
};
