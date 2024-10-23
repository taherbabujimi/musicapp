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
  playlistIdSchema,
} = require("../services/validation/deletePlaylistValidation");
const {
  errorResponseWithoutData,
  successResponseData,
  successResponseWithoutData,
  errorResponseData,
} = require("../services/responses");
const { PLAYLIST_TYPE } = require("../services/constants");

module.exports.createPlaylist = async (req, res) => {
  try {
    const validationResult = addPlaylistSchema(req.body, res);
    if (validationResult !== false) return;

    const { playlistname, playlist_type } = req.body;

    const oldPlaylist = await Models.Playlist.findOne({
      where: { playlistname: playlistname, created_by: req.user.id },
    });

    if (oldPlaylist) {
      return errorResponseWithoutData(res, messages.playlistAlreadyExists, 400);
    }

    const playlist = await Models.Playlist.create({
      playlistname,
      playlist_type,
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
    const validationResult = playlistIdSchema(req.body, res);
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
      await transaction.rollback();
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

module.exports.getPlaylist = async (req, res) => {
  try {
    const validationResult = playlistIdSchema(req.body, res);
    if (validationResult !== false) return;

    const { pageSize, page } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize) || 0;
    const limit = parseInt(pageSize || 10);

    const { playlist_id } = req.body;

    const { count, rows } = await Models.Song.findAndCountAll({
      include: [{ model: Models.Playlist, where: { id: playlist_id } }],
      limit,
      offset,
    });

    const songs = rows;

    const playlist = songs.map((song) => ({
      id: song.dataValues.Playlists[0].id,
      playlistname: song.dataValues.Playlists[0].playlistname,
      playlist_type: song.dataValues.Playlists[0].playlist_type,
      created_by: song.dataValues.Playlists[0].created_by,
      createdAt: song.dataValues.Playlists[0].createdAt,
      updatedAt: song.dataValues.Playlists[0].updatedAt,
    }));

    if (playlist.length === 0) {
      return errorResponseWithoutData(res, messages.playlistNotExists, 400);
    }

    if (
      playlist[0].playlist_type === PLAYLIST_TYPE.PRIVATE &&
      playlist[0].created_by !== req.user.id
    ) {
      return errorResponseWithoutData(
        res,
        messages.playlistAccessNotAllowed,
        400
      );
    }

    const songsWithoutPlaylist = songs.map((song) => ({
      id: song.dataValues.id,
      songname: song.dataValues.songname,
      created_by: song.dataValues.created_by,
      createdAt: song.dataValues.createdAt,
      updatedAt: song.dataValues.updatedAt,
    }));

    return successResponseData(
      res,
      songsWithoutPlaylist,
      200,
      messages.playlistFetchSuccess,
      {
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 10,
        totalDataCount: count,
      }
    );
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};

module.exports.likePlaylist = async (req, res) => {
  try {
    const validationResult = playlistIdSchema(req.body, res);
    if (validationResult !== false) return;

    const { playlist_id } = req.body;

    const playlist = await Models.Playlist.findOne({
      where: { id: playlist_id },
    });

    if (!playlist) {
      return errorResponseWithoutData(res, messages.playlistNotExists, 400);
    }

    if (
      playlist.playlist_type === PLAYLIST_TYPE.PRIVATE &&
      playlist.created_by !== req.user.id
    ) {
      return errorResponseWithoutData(
        res,
        messages.playlistAccessNotAllowed,
        400
      );
    }

    await playlist.addLikedBy(req.user.id);

    return successResponseWithoutData(res, messages.playlistLikedSuccess, 400);
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};

module.exports.unlikePlaylist = async (req, res) => {
  try {
    const validationResult = playlistIdSchema(req.body, res);
    if (validationResult !== false) return;

    const { playlist_id } = req.body;

    const playlist = await Models.Playlist.findOne({
      where: { id: playlist_id },
    });

    if (!playlist) {
      return errorResponseWithoutData(res, messages.playlistNotExists, 400);
    }

    await playlist.removeUser(req.user.id);

    return successResponseWithoutData(
      res,
      messages.playlistUnlikedSuccess,
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

module.exports.getAllPlaylists = async (req, res) => {
  try {
    const { page, pageSize } = req.query;

    const limit = parseInt(pageSize || 10);
    const offset = (parseInt(page) - 1) * parseInt(pageSize) || 0;

    const { count, rows } = await Models.Playlist.findAndCountAll({
      where: { playlist_type: PLAYLIST_TYPE.PUBLIC },
      attributes: [
        "id",
        "playlistname",
        [sequelize.fn("COUNT", sequelize.col("likedBy.id")), "userCount"],
      ],
      include: [
        {
          model: Models.User,
          as: "likedBy",
          attributes: ["id", "username", "email"],
        },
      ],
      group: ["Playlist.id", "Playlist.playlistname"],
      limit,
      offset,
    });

    // const playlistsWithUserCount = rows
    //   .map((playlist) => ({
    //     id: playlist.id,
    //     playlistname: playlist.playlistname,
    //     created_by: playlist.created_by,
    //     likes: playlist.Users.length,
    //   }))
    //   .sort((a, b) => b.likes - a.likes);

    const playlists = rows;

    if (!playlists) {
      return errorResponseWithoutData(res, messages.playlistNotExists);
    }

    return successResponseData(
      res,
      playlists,
      200,
      messages.playlistFetchSuccess,
      {
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 10,
        totalDataCount: count,
      }
    );
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};
