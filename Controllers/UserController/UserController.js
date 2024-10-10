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

module.exports.registerUser = async (req, res) => {
  try {
    const validationResponse = registerUserSchema(req, res);
    if (validationResponse) return;

    const { username, email, password, usertype } = req.body;

    if (
      [username, email, password, usertype].some(
        (field) => field?.trim() === ""
      )
    ) {
      return validationErrorResponseData(res, "All fields are required", 400);
    }

    const oldUser = await Models.User.findOne({
      where: { email: email },
    });

    if (oldUser) {
      return validationErrorResponseData(
        res,
        "User with this email already exists.",
        400
      );
    }

    const user = await Models.User.create({
      username,
      email,
      password,
      usertype,
    });

    return successResponseData(res, user, 200, "User created successfully");
  } catch (e) {
    errorResponseWithoutData(
      res,
      `Something went wrong while creating user: ${e}`,
      400
    );
  }
};

module.exports.userLogin = async (req, res) => {
  const validationResponse = userLoginSchema(req, res);
  if (validationResponse) return;

  const { email, password } = req.body;

  if (!password || !email) {
    return errorResponseWithoutData(
      res,
      "Please provide email and password.",
      400
    );
  }

  const user = await Models.User.findOne({
    where: { email: email },
  });

  if (!user) {
    return errorResponseWithoutData(res, "User does not exist", 400);
  }

  const isPasswordValid = await validPassword(password, user);

  if (!isPasswordValid) {
    return errorResponseWithoutData(
      res,
      "Please provide valid credentials.",
      400
    );
  }

  const accessToken = await generateAccessToken(user);

  return successResponseData(
    res,
    { user },
    200,
    "User logged in successfully.",
    accessToken
  );
};

module.exports.addSong = async (req, res) => {
  if (req.user.usertype === "user") {
    return errorResponseWithoutData(res, "Only admins can add songs.", 400);
  }

  const validationResponse = addSongSchema(req, res);

  if (validationResponse) return;

  const { songname, genres } = req.body;

  const oldSong = await Models.Song.findOne({
    where: { songname: songname },
  });

  if (oldSong) {
    return errorResponseWithoutData(
      res,
      "Song with this name already exist.",
      400
    );
  }

  const song = await Models.Song.create({ songname, created_by: req.user.id });

  console.log("Genres:", genres);

  const promises = [];

  for (const genre_id of genres) {
    const promise = song.addGenre(genre_id); // Pass only the genre_id
    promises.push(promise);
  }

  Promise.all(promises)
    .then((results) => {
      console.log("All genres added successfully:", results);
    })
    .catch((err) => {
      console.log("Error adding genres:", err);
    });

  return successResponseData(res, song, 200, "Song added successfully.");
};

module.exports.addGenre = async (req, res) => {
  if (req.user.usertype === "user") {
    return errorResponseWithoutData(res, "Only admins can add genre.", 400);
  }

  const validationResponse = addGenreSchema(req, res);

  if (validationResponse) return;

  const { genrename } = req.body;

  const oldGenre = await Models.Genre.findOne({
    where: { genrename: genrename },
  });

  if (oldGenre) {
    return errorResponseWithoutData(
      res,
      "Genre with this name already exist.",
      400
    );
  }

  const genre = await Models.Genre.create({
    genrename,
    created_by: req.user.id,
  });

  return successResponseData(res, genre, 200, "Genre created successfully.");
};
