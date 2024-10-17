const {
  createPlaylist,
  addSongsToPlaylist,
  removeSongsFromPlaylist,
} = require("../Controllers/playlistController");

const { verifyJWT } = require("../Middlewares/authMiddleware");
const {
  verifyUsertypeAndPermission,
} = require("../Middlewares/verifyUsertypeAndPermission");

const playlistRoute = require("express").Router();

playlistRoute.post(
  "/createPlaylist",
  verifyJWT,
  verifyUsertypeAndPermission(["user"]),
  createPlaylist
);

playlistRoute.post(
  "/addSongToPlaylist",
  verifyJWT,
  verifyUsertypeAndPermission(["user"]),
  addSongsToPlaylist
);

playlistRoute.delete(
  "/removeSongFromPlaylist",
  verifyJWT,
  verifyUsertypeAndPermission(["user"]),
  removeSongsFromPlaylist
);

module.exports = playlistRoute;
