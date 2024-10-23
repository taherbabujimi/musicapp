const {
  createPlaylist,
  addSongsToPlaylist,
  removeSongsFromPlaylist,
  deletePlaylist,
  getPlaylist,
  likePlaylist,
  getAllPlaylists,
  unlikePlaylist,
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

playlistRoute.get(
  "/getPlaylist",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.USER]),
  getPlaylist
);

playlistRoute.post(
  "/likePlaylist",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.USER]),
  likePlaylist
);

playlistRoute.get(
  "/getAllPlaylists",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.USER]),
  getAllPlaylists
);

playlistRoute.post(
  "/unlikePlaylist",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.USER]),
  unlikePlaylist
);

module.exports = playlistRoute;
