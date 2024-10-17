const {
  addGenre,
  getUserMusicGenre,
} = require("../Controllers/genreController");

const { verifyJWT } = require("../Middlewares/authMiddleware");
const {
  verifyUsertypeAndPermission,
} = require("../Middlewares/verifyUsertypeAndPermission");

const genreRoute = require("express").Router();

genreRoute.post(
  "/addGenre",
  verifyJWT,
  verifyUsertypeAndPermission(["admin"], ["add_genre"]),
  addGenre
);
genreRoute.get(
  "/getUserMusicGenre",
  verifyJWT,
  verifyUsertypeAndPermission(["admin"]),
  getUserMusicGenre
);

module.exports = genreRoute;
