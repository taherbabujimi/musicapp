const Models = require("../../models/index");
const {
  validPassword,
  generateAccessToken,
} = require("../../services/helpers");
const {
  registerUserSchema,
  userLoginSchema,
} = require("../../services/validation/userValidation");
const { addSongSchema } = require("../../services/validation/songValidation");
const { addGenreSchema } = require("../../services/validation/genreValidation");
const {
  addPlaylistSchema,
} = require("../../services/validation/playlistValidation");
const {
  addSongToPlaylistSchema,
} = require("../../services/validation/addSongsToPlaylistValidation");
const {
  validationErrorResponseData,
  successResponseData,
  errorResponseWithoutData,
  errorResponseData,
  successResponseWithoutData,
} = require("../../services/responses");
const Joi = require("joi");
const { USER_TYPE } = require("../../services/constants");
const { messages } = require("../../services/messages");

const {
  getSongSchema,
} = require("../../services/validation/getSongValidation");
const { Op } = require("sequelize");

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

module.exports.searchSongs = async (req, res) => {
  const validationResult = addGenreSchema(req.body, res);
  if (validationResult) return;

  const { genrename } = req.body;

  const songsAsPerGenre = await Models.Genre.findOne({
    where: { genrename: genrename },
    include: { model: Models.Song },
  });

  if (!songsAsPerGenre) {
    return errorResponseWithoutData(res, messages.songNotFetched, 400);
  }

  return successResponseData(
    res,
    songsAsPerGenre,
    200,
    messages.songFetchSuccessAsGenre
  );
};

module.exports.getSong = async (req, res) => {
  const validationResult = getSongSchema(req.body, res);

  if (validationResult) return;

  const { songname } = req.body;

  const song = await Models.Song.findOne({
    where: { songname: songname },
    include: [{ model: Models.Genre, through: { attributes: [] } }],
  });

  const genreIds = song.dataValues.Genres.map((genre) => genre.id);

  if (!song) {
    return errorResponseWithoutData(res, messages.songNotExists, 400);
  }

  let songData = {
    id: song.id,
    songname: song.songname,
    created_by: song.created_by,
    createdAt: song.createdAt,
    updatedAt: song.updatedAt,
  };

  successResponseData(res, songData, 200, messages.songFetchSuccess);

  const user = await Models.User.findOne({
    where: { id: req.user.id },
  });

  // Initialize user_genre_preference if it doesn't exist
  if (user.user_genre_preference === null) {
    user.user_genre_preference = { json: [] };
  }

  // Update genre preferences
  for (let i = 0; i < genreIds.length; i++) {
    const genreId = genreIds[i];
    const existingGenre = user.user_genre_preference.json.find(
      (item) => item.genre_id === genreId
    );

    if (existingGenre) {
      // Increment count if genre_id already
      existingGenre.count += 1;
    } else if (!existingGenre) {
      // Add new entry if genre_id does not exist
      user.user_genre_preference.json.push({
        genre_id: genreId,
        count: 1,
      });
    }
  }

  await user.changed("user_genre_preference", true);
  await user.save();
};

module.exports.createPlaylist = async (req, res) => {
  const validationResult = addPlaylistSchema(req.body, res);
  if (validationResult) return;

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
};

module.exports.addSongsToPlaylist = async (req, res) => {
  const validationResult = addSongToPlaylistSchema(req.boy, res);
  if (validationResult) return;

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
};

module.exports.removeSongsFromPlaylist = async (req, res) => {
  const validationResult = addSongToPlaylistSchema(req.body, res);
  if (validationResult) return;

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

  return successResponseWithoutData(res, messages.songRemoveFromPlaylist, 200);
};

module.exports.getRecommendedSongs = async (req, res) => {
  const user = await Models.User.findOne({
    where: { id: req.user.id },
  });

  if (!user) {
    return errorResponseWithoutData(res, messages.somethingWentWrong, 400);
  }

  const jsonData = user.user_genre_preference.json;
  jsonData.sort((a, b) => b.count - a.count);

  let bestGenres = [
    jsonData[0].genre_id,
    jsonData[1].genre_id,
    jsonData[2].genre_id,
  ];

  const song = await Models.Genre.findAll({
    where: { id: { [Op.in]: bestGenres } },
    include: [
      {
        model: Models.Song,
        through: { attributes: [] },
        distinct: true,
        col: "songs.id",
      },
    ],
  });

  if (!song) {
    return errorResponseWithoutData(res, messages.somethingWentWrong, 400);
  }

  const songs = song.flatMap((genre) =>
    genre.dataValues.Songs.map((song) => song)
  );

  const uniqueData = Array.from(new Set(songs.map((item) => item.id))).map(
    (id) => songs.find((item) => item.id === id)
  );

  return successResponseData(
    res,
    uniqueData,
    200,
    messages.recommendedSongFetch
  );
};
