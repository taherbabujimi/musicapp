const {
  addSong,
  getSong,
  getSongsByGenre,
  getRecommendedSongs,
} = require("../Controllers/songController");
const { verifyJWT } = require("../Middlewares/authMiddleware");
const {
  verifyUsertypeAndPermission,
} = require("../Middlewares/verifyUsertypeAndPermission");
const { USER_TYPE, PERMISSION } = require("../services/constants");

//For multer
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

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
  getSongsByGenre
);
songRoute.get(
  "/getRecommendedSongs",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.USER]),
  getRecommendedSongs
);

module.exports = songRoute;
