const Models = require("../models/index");

const { messages } = require("../services/messages");
const { addGenreSchema } = require("../services/validation/genreValidation");
const {
  getUserMusicGenreSchema,
} = require("../services/validation/getUserMusicGenreValidation");
const {
  errorResponseWithoutData,
  successResponseData,
  successResponseWithoutData,
} = require("../services/responses");

const { Op } = require("sequelize");

module.exports.addGenre = async (req, res) => {
  try {
    const validationResponse = addGenreSchema(req.body, res);
    if (validationResponse !== false) return;

    const genrename = req.body.genrename.replace(/ +/g, "");

    const data = await Models.sequelize.query(
      "CALL addGenre(:genrename, :created_by)",
      {
        replacements: {
          genrename,
          created_by: req.user.id,
        },
      }
    );

    const genre = data[0].result;

    if (genre.message === "Genre already exist") {
      return errorResponseWithoutData(res, messages.genreAlreadyExists, 400);
    }

    return successResponseData(res, genre, 200, messages.genreCreated);
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};

module.exports.getUserMusicGenre = async (req, res) => {
  try {
    const validationResponse = getUserMusicGenreSchema(req.body, res);
    if (validationResponse !== false) return;

    const { user_id } = req.body;
    const { page, pageSize } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize) || 0;
    const limit = parseInt(pageSize || 8);

    const data = await Models.sequelize.query("CALL getOneUser(:user_id)", {
      replacements: {
        user_id,
      },
    });

    const user = data[0].result;

    if (user.message === "User does not exist") {
      return errorResponseWithoutData(res, messages.userNotExist, 400);
    }

    if (user.user_genre_preference === null) {
      return successResponseWithoutData(
        res,
        messages.previousGenrePreferenceNotFound,
        200
      );
    }

    const userGenrePreference = user.user_genre_preference;

    const genreIds = userGenrePreference.json.map((genre) => genre.genre_id);

    const countTotal = userGenrePreference.json.reduce(
      (accumulator, currentValue) => {
        const newAccumulator = accumulator + currentValue.count;
        return newAccumulator;
      },
      0
    );

    const genres = await Models.sequelize.query(
      "CALL getGenresUsingIds(:genreIds, :limit, :offset)",
      {
        replacements: {
          genreIds: JSON.stringify(genreIds),
          limit,
          offset,
        },
      }
    );

    let genreWithPercentage = [];

    for (let i = 0; i < genres.length; i++) {
      let percentage = Math.round(
        (userGenrePreference.json[i].count / countTotal) * 100
      );
      genreWithPercentage.push({
        genre_name: genres[i].genrename,
        percentage: `${percentage}%`,
      });
    }

    return successResponseData(
      res,
      genreWithPercentage,
      200,
      messages.previousGenrePreferenceFetched
    );
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};
