const Models = require("../models/index");

const { messages } = require("../services/messages");
const {
  addPlaylistSchema,
} = require("../services/validation/playlistValidation");
const {
  addSongToPlaylistSchema,
} = require("../services/validation/addSongsToPlaylistValidation");
const {
  errorResponseWithoutData,
  successResponseData,
  successResponseWithoutData,
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

    const { songname, playlistname } = req.body;

    const song = await Models.Song.findOne({
      where: { songname: songname },
    });

    if (!song) {
      return errorResponseWithoutData(res, messages.songNotExists, 400);
    }

    const playlist = await Models.Playlist.findOne({
      where: { playlistname: playlistname, created_by: req.user.id },
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

    const { songname, playlistname } = req.body;

    const song = await Models.Song.findOne({
      where: { songname: songname },
    });

    if (!song) {
      return errorResponseWithoutData(res, messages.songNotExists, 400);
    }

    const playlist = await Models.Playlist.findOne({
      where: { playlistname: playlistname, created_by: req.user.id },
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
