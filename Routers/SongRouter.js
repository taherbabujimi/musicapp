const {
  addSong,
  getSong,
  searchSongs,
  getRecommendedSongs,
} = require("../Controllers/songController");
const { verifyJWT } = require("../Middlewares/authMiddleware");
const { verifyUserUsertype } = require("../Middlewares/verifyUserUsertype");
const { verifyAdminUsertype } = require("../Middlewares/verifyAdminUsertype");

const songRoute = require("express").Router();

songRoute.post("/addSong", verifyJWT, verifyAdminUsertype, addSong);
songRoute.get("/getSong", verifyJWT, verifyUserUsertype, getSong);
songRoute.get("/getSongsByGenre", verifyJWT, verifyUserUsertype, searchSongs);
songRoute.get(
  "/getRecommendedSongs",
  verifyJWT,
  verifyUserUsertype,
  getRecommendedSongs
);

module.exports = songRoute;
