const Models = require("../../models/index");
const { Op, Model } = require("sequelize");
const {
  validPassword,
  generateAccessToken,
} = require("../../services/helpers");

const {
  registerUserSchema,
  userLoginSchema,
} = require("../../services/validation/userValidation");

const { addSongSchema } = require("../../services/validation/songValidation");

const {
  validationErrorResponseData,
  successResponseData,
  errorResponseWithoutData,
  errorResponseData,
} = require("../../services/responses");

const Joi = require("joi");
const { addGenreSchema } = require("../../services/validation/genreValidation");

const { USER_TYPE } = require("../../services/constants");

const { messages } = require("../../services/messages");

module.exports.registerUser = async (req, res) => {
  try {
    const validationResponse = registerUserSchema(req.body, res);
    if (validationResponse) return;

    const { username, email, password, usertype } = req.body;

    const oldUser = await Models.User.findOne({
      where: { email: email },
    });

    if (oldUser) {
      return validationErrorResponseData(res, messages.userAlreadyExists, 400);
    }

    const user = await Models.User.create({
      username,
      email,
      password,
      usertype,
    });

    return successResponseData(res, user, 200, messages.userCreated);
  } catch (e) {
    errorResponseWithoutData(
      res,
      `Something went wrong while creating user: ${e}`,
      400
    );
  }
};

module.exports.userLogin = async (req, res) => {
  const validationResponse = userLoginSchema(req.body, res);
  if (validationResponse) return;

  const { email, password } = req.body;

  const user = await Models.User.findOne({
    where: { email: email },
  });

  if (!user) {
    return errorResponseWithoutData(res, messages.userNotExist, 400);
  }

  const isPasswordValid = await validPassword(password, user);

  if (!isPasswordValid) {
    return errorResponseWithoutData(res, messages.incorrectCredentials, 400);
  }

  const accessToken = await generateAccessToken(user);

  const userData = {
    username: user.username,
    email: user.email,
    usertype: user.usertype,
  };

  return successResponseData(
    res,
    userData,
    200,
    messages.userLoginSuccess,
    accessToken
  );
};

module.exports.addSong = async (req, res) => {
  const validationResponse = addSongSchema(req.body, res);

  if (validationResponse) return;

  const { songname, genres } = req.body;

  const oldSong = await Models.Song.findOne({
    where: { songname: songname },
  });

  if (oldSong) {
    return errorResponseWithoutData(res, messages.songAlreadyExists, 400);
  }

  const song = await Models.Song.create({ songname, created_by: req.user.id });

  const promises = genres.map((genre_id) => song.addGenre(genre_id));

  Promise.all(promises)
    .then((results) => {
      console.log(messages.genreAdded, results);
    })
    .catch((err) => {
      console.log(messages.genreErrorAdding, err);
    });

  return successResponseData(res, song, 200, messages.songCreated);
};

module.exports.addGenre = async (req, res) => {
  const validationResponse = addGenreSchema(req.body, res);

  if (validationResponse) return;

  const { genrename } = req.body;

  const oldGenre = await Models.Genre.findOne({
    where: { genrename: genrename },
  });

  if (oldGenre) {
    return errorResponseWithoutData(res, messages.genreAlreadyExists, 400);
  }

  const genre = await Models.Genre.create({
    genrename,
    created_by: req.user.id,
  });

  return successResponseData(res, genre, 200, messages.genreCreated);
};
