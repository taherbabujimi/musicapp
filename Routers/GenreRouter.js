const {
  addGenre,
  getUserMusicGenre,
} = require("../Controllers/genreController");

const { verifyJWT } = require("../Middlewares/authMiddleware");
const {
  verifyUsertypeAndPermission,
} = require("../Middlewares/verifyUsertypeAndPermission");
const { USER_TYPE, PERMISSION } = require("../services/constants");

const genreRoute = require("express").Router();

genreRoute.post(
  "/addGenre",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.ADMIN], [PERMISSION.ADD_GENRE]),
  addGenre
);
genreRoute.get(
  "/getUserMusicGenre",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.ADMIN]),
  getUserMusicGenre
);

module.exports = genreRoute;
