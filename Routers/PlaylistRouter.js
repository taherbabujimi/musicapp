const {
  createPlaylist,
  addSongsToPlaylist,
  removeSongsFromPlaylist,
  deletePlaylist,
} = require("../Controllers/playlistController");

const { verifyJWT } = require("../Middlewares/authMiddleware");
const {
  verifyUsertypeAndPermission,
} = require("../Middlewares/verifyUsertypeAndPermission");
const { USER_TYPE } = require("../services/constants");

const playlistRoute = require("express").Router();

playlistRoute.post(
  "/createPlaylist",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.USER]),
  createPlaylist
);

playlistRoute.post(
  "/addSongToPlaylist",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.USER]),
  addSongsToPlaylist
);

playlistRoute.delete(
  "/removeSongFromPlaylist",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.USER]),
  removeSongsFromPlaylist
);

playlistRoute.delete(
  "/deletePlaylist",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.USER]),
  deletePlaylist
);

module.exports = playlistRoute;
