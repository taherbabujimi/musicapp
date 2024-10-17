const {
  addSong,
  getSong,
  searchSongs,
  getRecommendedSongs,
} = require("../Controllers/songController");
const { verifyJWT } = require("../Middlewares/authMiddleware");
const {
  verifyUsertypeAndPermission,
} = require("../Middlewares/verifyUsertypeAndPermission");

const songRoute = require("express").Router();

songRoute.post(
  "/addSong",
  verifyJWT,
  verifyUsertypeAndPermission(["admin"], ["add_song"]),
  addSong
);
songRoute.get(
  "/getSong",
  verifyJWT,
  verifyUsertypeAndPermission(["user"]),
  getSong
);
songRoute.get(
  "/getSongsByGenre",
  verifyJWT,
  verifyUsertypeAndPermission(["user"]),
  searchSongs
);
songRoute.get(
  "/getRecommendedSongs",
  verifyJWT,
  verifyUsertypeAndPermission(["user"]),
  getRecommendedSongs
);

module.exports = songRoute;
