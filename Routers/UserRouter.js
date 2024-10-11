const {
  registerUser,
  userLogin,
  addSong,
  addGenre,
} = require("../Controllers/UserController/UserController.js");
const { verifyJWT } = require("../Middlewares/authMiddleware.js");
const { verifyUsertype } = require("../Middlewares/verifyUsertype.js");

const userRoute = require("express").Router();

userRoute.post("/add", registerUser);
userRoute.post("/login", userLogin);
userRoute.post("/addSong", verifyJWT, verifyUsertype, addSong);
userRoute.post("/addGenre", verifyJWT, verifyUsertype, addGenre);

module.exports = userRoute;
