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

    const data = await Models.sequelize.query(
      "CALL addSong(:songname, :createdBy, :path, :genres)",
      {
        replacements: {
          songname,
          createdBy: req.user.id,
          path: req.file.path,
          genres: JSON.stringify(genres),
        },
      }
    );

    const song = data[0].result.message;

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

    let songData;

    const cachedData = await client.get(song_id);

    if (cachedData !== null) {
      songData = JSON.parse(cachedData);
    } else {
      const Data = await Models.sequelize.query("CALL getSong(:song_id)", {
        replacements: {
          song_id,
        },
      });

      songData = Data[0].result;

      if (songData.message === "Song does not exist") {
        return errorResponseWithoutData(res, messages.songNotExists, 400);
      }

      await client.set(song_id, JSON.stringify(songData));
      await client.expire(song_id, 3600);
    }

    const user = await Models.User.findOne({
      where: { id: req.user.id },
    });

    if (user.user_genre_preference === null) {
      user.user_genre_preference = { json: [] };
    }

    for (let i = 0; i < songData.genres.length; i++) {
      const genreId = songData.genres[i];
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

    let readStream = createReadStream(songData.path);
    readStream.pipe(res);
  } catch (error) {
    console.log(error);
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};

module.exports.getSongsByGenre = async (req, res) => {
  try {
    const validationResult = addGenreSchema(req.body, res);
    if (validationResult !== false) return;

    const { page, pageSize } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize) || 0;
    const limit = parseInt(pageSize || 8);

    const { genrename } = req.body;

    const data = await Models.sequelize.query(
      "CALL getSongsByGenre(:genrename, :limit, :offset)",
      {
        replacements: {
          genrename,
          limit,
          offset,
        },
      }
    );

    const songs = data[0].result;

    if (songs.message === "Genre does not exist") {
      return errorResponseWithoutData(res, messages.genreNotExist, 400);
    }

    return successResponseData(
      res,
      songs,
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

    const user = req.user;

    let bestGenres = [];

    if (user.user_genre_preference !== null) {
      const jsonData = user.user_genre_preference.json;

      jsonData.sort((a, b) => b.count - a.count);

      if (jsonData.length >= process.env.TOP_GENRE_COUNT) {
        for (let i = 0; i < process.env.TOP_GENRE_COUNT; i++) {
          bestGenres.push(jsonData[i].genre_id);
        }

        bestGenres = JSON.stringify(bestGenres);
      } else if (jsonData.length < process.env.TOP_GENRE_COUNT) {
        for (let i = 0; i < jsonData.length; i++) {
          bestGenres.push(jsonData[i].genre_id);
        }

        bestGenres = JSON.stringify(bestGenres);
      }
    } else {
      bestGenres = null;
    }

    const data = await Models.sequelize.query(
      "CALL getAllSongs(:bestGenres, :limit, :offset)",
      {
        replacements: {
          limit,
          offset,
          bestGenres,
        },
      }
    );

    const song = data[0].result;

    return successResponseData(res, song, 200, messages.recommendedSongFetch);
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};
