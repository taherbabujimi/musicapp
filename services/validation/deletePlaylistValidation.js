"use strict";
const Joi = require("joi");
const { errorResponseData } = require("../responses");
const { messages } = require("../messages");

module.exports = {
  deletePlaylistSchema(body, res) {
    const Schema = Joi.object({
      playlist_id: Joi.number().required(),
    });

    const validationResult = Schema.validate(body);

    if (validationResult.error) {
      return errorResponseData(
        res,
        messages.errorValidatingValues,
        validationResult.error.details,
        400
      );
    } else {
      return false;
    }
  },
};
