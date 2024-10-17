const {
  addGenre,
  getUserMusicGenre,
} = require("../Controllers/genreController");

const { verifyJWT } = require("../Middlewares/authMiddleware");
const { verifyAdminUsertype } = require("../Middlewares/verifyAdminUsertype");

const genreRoute = require("express").Router();

genreRoute.post("/addGenre", verifyJWT, verifyAdminUsertype, addGenre);
genreRoute.get(
  "/getUserMusicGenre",
  verifyJWT,
  verifyAdminUsertype,
  getUserMusicGenre
);

module.exports = genreRoute;
