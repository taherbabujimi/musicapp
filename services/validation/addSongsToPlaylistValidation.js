"use strict";

const Joi = require("joi");
const { errorResponseData } = require("../responses");
const { messages } = require("../messages");

module.exports = {
  addSongToPlaylistSchema(body, res) {
    const Schema = Joi.object({
      songname: Joi.string().min(3).max(30).required(),
      playlistname: Joi.string().min(3).max(30).required(),
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
