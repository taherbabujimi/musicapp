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

songRoute.post("/addSong", verifyJWT, upload.single("audioFile"), addSong);

songRoute.get(
  "/getSong",
  verifyJWT,
  getSong
);

songRoute.get(
  "/getSongsByGenre",
  verifyJWT,
  getSongsByGenre
);

songRoute.get(
  "/getRecommendedSongs",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.USER]),
  getRecommendedSongs
);

module.exports = songRoute;
