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
const { USER_TYPE, PERMISSION } = require("../services/constants");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const songRoute = require("express").Router();

songRoute.post(
  "/addSong",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.ADMIN], [PERMISSION.ADD_SONG]),
  upload.single("audioFile"),
  addSong
);
songRoute.get(
  "/getSong",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.USER]),
  getSong
);
songRoute.get(
  "/getSongsByGenre",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.USER]),
  searchSongs
);
songRoute.get(
  "/getRecommendedSongs",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.USER]),
  getRecommendedSongs
);

module.exports = songRoute;
