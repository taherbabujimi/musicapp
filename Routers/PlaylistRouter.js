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

playlistRoute.post("/createPlaylist", verifyJWT, createPlaylist);

playlistRoute.post("/addSongToPlaylist", verifyJWT, addSongsToPlaylist);

playlistRoute.delete(
  "/removeSongFromPlaylist",
  verifyJWT,
  removeSongsFromPlaylist
);

playlistRoute.delete("/deletePlaylist", verifyJWT, deletePlaylist);

module.exports = playlistRoute;
