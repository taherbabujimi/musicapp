const {
  registerUser,
  userLogin,
  addSong,
  addGenre,
  searchSongs,
  createPlaylist,
  addSongsToPlaylist,
  removeSongsFromPlaylist,
  getSong,
  getRecommendedSongs,
} = require("../Controllers/UserController/UserController.js");
const { verifyJWT } = require("../Middlewares/authMiddleware.js");
const {
  verifyAdminUsertype,
} = require("../Middlewares/verifyAdminUsertype.js");
const { verifyUserUsertype } = require("../Middlewares/verifyUserUsertype.js");

const userRoute = require("express").Router();

userRoute.post("/add", registerUser);
userRoute.post("/login", userLogin);
userRoute.post("/addSong", verifyJWT, verifyAdminUsertype, addSong);
userRoute.post("/addGenre", verifyJWT, verifyAdminUsertype, addGenre);
userRoute.get("/getSongsByGenre", verifyJWT, verifyUserUsertype, searchSongs);
userRoute.post(
  "/createPlaylist",
  verifyJWT,
  verifyUserUsertype,
  createPlaylist
);
userRoute.post(
  "/addSongToPlaylist",
  verifyJWT,
  verifyUserUsertype,
  addSongsToPlaylist
);
userRoute.delete(
  "/removeSongFromPlaylist",
  verifyJWT,
  verifyUserUsertype,
  removeSongsFromPlaylist
);
userRoute.get("/getSong", verifyJWT, verifyUserUsertype, getSong);
userRoute.get(
  "/getRecommendedSongs",
  verifyJWT,
  verifyUserUsertype,
  getRecommendedSongs
);

module.exports = userRoute;
