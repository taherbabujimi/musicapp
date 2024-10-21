const Models = require("../models/index");
const { Op } = require("sequelize");

const { messages } = require("../services/messages");
const { getSongSchema } = require("../services/validation/getSongValidation");
const { addSongSchema } = require("../services/validation/songValidation");
const { addGenreSchema } = require("../services/validation/genreValidation");
const {
  errorResponseWithoutData,
  successResponseData,
} = require("../services/responses");

const { createReadStream } = require("fs");
const { client } = require("../config/redis");

module.exports.addSong = async (req, res) => {
  try {
    const validationResponse = addSongSchema(req.body, res);

    if (validationResponse !== false) return;

    await client.flushAll();

    const { songname, genres } = req.body;

    const song = await Models.Song.create({
      songname,
      created_by: req.user.id,
      path: req.file.path,
    });

    const promises = genres.map((genre_id) => song.addGenre(genre_id));

    Promise.all(promises)
      .then((results) => {
        console.log(messages.genreAdded, results);
      })
      .catch((err) => {
        console.log(messages.genreErrorAdding, err);
      });

    return successResponseData(res, song, 200, messages.songCreated);
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};

module.exports.getSong = async (req, res) => {
  try {
    const validationResult = getSongSchema(req.body, res);

    if (validationResult !== false) return;

    const { song_id } = req.body;

    const data = await client.get(song_id);

    if (data !== null) {
      return successResponseData(
        res,
        JSON.parse(data),
        200,
        `${messages.songFetchSuccess}, from cache`
      );
    }

    const song = await Models.Song.findOne({
      where: { id: song_id },
      include: [{ model: Models.Genre, through: { attributes: [] } }],
    });

    if (!song) {
      return errorResponseWithoutData(res, messages.songNotExists, 400);
    }

    const genreIds = song.dataValues.Genres.map((genre) => genre.id);

    let songData = {
      id: song.id,
      songname: song.songname,
      created_by: song.created_by,
      createdAt: song.createdAt,
      updatedAt: song.updatedAt,
    };

    const songPath = song.path;

    let readStream = createReadStream(songPath);
    readStream.pipe(res);

    await client.set(song_id, JSON.stringify(songData));
    await client.expire(song_id, 10);

    // successResponseData(res, songData, 200, messages.songFetchSuccess);

    const user = await Models.User.findOne({
      where: { id: req.user.id },
    });

    if (user.user_genre_preference === null) {
      user.user_genre_preference = { json: [] };
    }

    for (let i = 0; i < genreIds.length; i++) {
      const genreId = genreIds[i];
      const existingGenre = user.user_genre_preference.json.find(
        (item) => item.genre_id === genreId
      );

      if (existingGenre) {
        existingGenre.count += 1;
      } else if (!existingGenre) {
        user.user_genre_preference.json.push({
          genre_id: genreId,
          count: 1,
        });
      }
    }

    await user.changed("user_genre_preference", true);
    await user.save();
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};

module.exports.searchSongs = async (req, res) => {
  try {
    const validationResult = addGenreSchema(req.body, res);
    if (validationResult !== false) return;

    const { page, pageSize } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize) || 0;
    const limit = parseInt(pageSize || 8);

    const { genrename } = req.body;

    const songsAsPerGenre = await Models.Song.findAll({
      include: [
        {
          model: Models.Genre,
          where: { genrename },
        },
      ],
      offset,
      limit,
    });

    if (!songsAsPerGenre) {
      return errorResponseWithoutData(res, messages.songNotFetched, 400);
    }

    const songsWithoutGenres = songsAsPerGenre.map((song) => ({
      id: song.dataValues.id,
      songname: song.dataValues.songname,
      created_by: song.dataValues.created_by,
      createdAt: song.dataValues.createdAt,
      updatedAt: song.dataValues.updatedAt,
    }));

    return successResponseData(
      res,
      songsWithoutGenres,
      200,
      messages.songFetchSuccessAsGenre
    );
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};

module.exports.getRecommendedSongs = async (req, res) => {
  try {
    const { page, pageSize } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize) || 0;
    const limit = parseInt(pageSize || 8);

    const user = await Models.User.findOne({
      where: { id: req.user.id },
    });

    if (!user) {
      return errorResponseWithoutData(res, messages.somethingWentWrong, 400);
    }

    if (user.user_genre_preference === null) {
      const songs = await Models.Song.findAll({
        limit,
        offset,
      });

      return successResponseData(
        res,
        songs,
        200,
        messages.recommendedSongFetch,
        { limit: limit, offset: offset }
      );
    }

    const jsonData = user.user_genre_preference.json;

    jsonData.sort((a, b) => b.count - a.count);

    let bestGenres = [];

    if (jsonData.length >= process.env.TOP_GENRE_COUNT) {
      for (let i = 0; i < process.env.TOP_GENRE_COUNT; i++) {
        bestGenres.push(jsonData[i].genre_id);
      }
    } else if (jsonData.length < process.env.TOP_GENRE_COUNT) {
      for (let i = 0; i < jsonData.length; i++) {
        bestGenres.push(jsonData[i].genre_id);
      }
    }

    const song = await Models.Song.findAll({
      include: [
        {
          model: Models.Genre,
          where: { id: { [Op.in]: bestGenres } },
        },
      ],
      offset,
      limit,
    });

    if (!song) {
      return errorResponseWithoutData(res, messages.somethingWentWrong, 400);
    }

    const songsWithoutGenres = song.map((song) => ({
      id: song.dataValues.id,
      songname: song.dataValues.songname,
      created_by: song.dataValues.created_by,
      createdAt: song.dataValues.createdAt,
      updatedAt: song.dataValues.updatedAt,
    }));

    return successResponseData(
      res,
      songsWithoutGenres,
      200,
      messages.recommendedSongFetch
    );
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};
