const Models = require("../models/index");
const { sequelize } = require("../models/index");
const { Op } = require("sequelize");

const { messages } = require("../services/messages");
const {
  addPlaylistSchema,
} = require("../services/validation/playlistValidation");
const {
  addSongToPlaylistSchema,
} = require("../services/validation/addSongsToPlaylistValidation");
const {
  deletePlaylistSchema,
} = require("../services/validation/deletePlaylistValidation");
const {
  errorResponseWithoutData,
  successResponseData,
  successResponseWithoutData,
  errorResponseData,
} = require("../services/responses");

module.exports.createPlaylist = async (req, res) => {
  try {
    const validationResult = addPlaylistSchema(req.body, res);
    if (validationResult !== false) return;

    const { playlistname } = req.body;

    const data = await Models.sequelize.query(
      "CALL addPlaylist(:playlistname, :createdBy)",
      {
        replacements: {
          playlistname,
          createdBy: req.user.id,
        },
      }
    );

    const playlist = data[0].result;

    if (playlist.message === "Playlist already exist") {
      return errorResponseWithoutData(res, messages.playlistAlreadyExists, 400);
    }

    return successResponseData(res, playlist, 200, messages.playlistCreated);
  } catch (error) {
    console.log(error);
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};

module.exports.addSongsToPlaylist = async (req, res) => {
  try {
    const validationResult = addSongToPlaylistSchema(req.body, res);

    if (validationResult !== false) return;

    const { song_id, playlist_id } = req.body;

    const data = await Models.sequelize.query(
      "CALL addSongToPlaylist(:song_id, :playlist_id, :user_id)",
      {
        replacements: {
          song_id,
          playlist_id,
          user_id: req.user.id,
        },
      }
    );

    const songToPlaylist = data[0].result;

    return successResponseData(
      res,
      songToPlaylist.data,
      songToPlaylist.status,
      songToPlaylist.message
    );
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};

module.exports.removeSongsFromPlaylist = async (req, res) => {
  try {
    const validationResult = addSongToPlaylistSchema(req.body, res);
    if (validationResult !== false) return;

    const { song_id, playlist_id } = req.body;

    const data = await Models.sequelize.query(
      "CALL removeSongFromPlaylist(:song_id, :playlist_id, :user_id)",
      {
        replacements: {
          song_id,
          playlist_id,
          user_id: req.user.id,
        },
      }
    );

    const removedFromPlaylist = data[0].result;

    return successResponseWithoutData(
      res,
      removedFromPlaylist.message,
      removedFromPlaylist.status
    );
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};

module.exports.deletePlaylist = async (req, res) => {
  try {
    const validationResult = deletePlaylistSchema(req.body, res);
    if (validationResult !== false) return;

    const { playlist_id } = req.body;

    const data = await Models.sequelize.query(
      "CALL deletePlaylist(:playlist_id, :user_id)",
      {
        replacements: {
          playlist_id,
          user_id: req.user.id,
        },
      }
    );

    return successResponseWithoutData(
      res,
      data[0].result.message,
      data[0].result.status
    );
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};
