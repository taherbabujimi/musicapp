"use strict";

const Joi = require("joi");

const { errorResponseData } = require("../responses");
const { messages } = require("../messages");
const { PLAYLIST_TYPE } = require("../constants");

module.exports = {
  addPlaylistSchema(body, res) {
    const Schema = Joi.object({
      playlistname: Joi.string().min(3).max(30).required(),
      playlist_type: Joi.string().valid(
        PLAYLIST_TYPE.PRIVATE,
        PLAYLIST_TYPE.PUBLIC
      ),
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
