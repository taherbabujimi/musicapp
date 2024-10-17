const {
  createPlaylist,
  addSongsToPlaylist,
  removeSongsFromPlaylist,
} = require("../Controllers/playlistController");

const { verifyJWT } = require("../Middlewares/authMiddleware");
const { verifyUserUsertype } = require("../Middlewares/verifyUserUsertype");

const playlistRoute = require("express").Router();

playlistRoute.post(
  "/createPlaylist",
  verifyJWT,
  verifyUserUsertype,
  createPlaylist
);

playlistRoute.post(
  "/addSongToPlaylist",
  verifyJWT,
  verifyUserUsertype,
  addSongsToPlaylist
);

playlistRoute.delete(
  "/removeSongFromPlaylist",
  verifyJWT,
  verifyUserUsertype,
  removeSongsFromPlaylist
);

module.exports = playlistRoute;
