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

    const oldPlaylist = await Models.Playlist.findOne({
      where: { playlistname: playlistname, created_by: req.user.id },
    });

    if (oldPlaylist) {
      return errorResponseWithoutData(res, messages.playlistAlreadyExists, 400);
    }

    const playlist = await Models.Playlist.create({
      playlistname: playlistname,
      created_by: req.user.id,
    });

    return successResponseData(res, playlist, 200, messages.playlistCreated);
  } catch (error) {
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

    const song = await Models.Song.findOne({
      where: { id: song_id },
    });

    if (!song) {
      return errorResponseWithoutData(res, messages.songNotExists, 400);
    }

    const playlist = await Models.Playlist.findOne({
      where: { id: playlist_id, created_by: req.user.id },
    });

    if (!playlist) {
      return errorResponseWithoutData(res, messages.userNotHavePlaylist, 400);
    }

    const addSongToPlaylist = await song.addPlaylist(playlist.id);

    return successResponseData(
      res,
      addSongToPlaylist,
      200,
      messages.songAddToPlaylistSuccess
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

    const song = await Models.Song.findOne({
      where: { id: song_id },
    });

    if (!song) {
      return errorResponseWithoutData(res, messages.songNotExists, 400);
    }

    const playlist = await Models.Playlist.findOne({
      where: { id: playlist_id, created_by: req.user.id },
    });

    if (!playlist) {
      return errorResponseWithoutData(res, messages.userNotHavePlaylist, 400);
    }

    await song.removePlaylist(playlist.id);

    return successResponseWithoutData(
      res,
      messages.songRemoveFromPlaylist,
      200
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
  const transaction = await sequelize.transaction();
  try {
    const validationResult = deletePlaylistSchema(req.body, res);
    if (validationResult !== false) return;

    const { playlist_id } = req.body;

    const playlist = await Models.Playlist.findOne(
      {
        where: { id: playlist_id, created_by: req.user.id },
        include: [{ model: Models.Song, through: { attributes: [] } }],
      },
      { transaction }
    );

    if (!playlist) {
      return errorResponseWithoutData(res, messages.playlistNotExists, 400);
    }

    const songs = playlist.dataValues.Songs.map((song) => song.id);

    await playlist.destroy({ transaction });

    const promises = songs.map((song_id) =>
      playlist.removeSong(song_id, { transaction })
    );

    Promise.all(promises)
      .then(async (result) => {
        await transaction.commit();
        return successResponseWithoutData(res, messages.playlistDeleted, 200);
      })
      .catch(async (error) => {
        await transaction.rollback();
        return errorResponseData(
          res,
          messages.errorDeletingPlaylist,
          error,
          400
        );
      });
  } catch (error) {
    await transaction.rollback();
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};
