const {
  registerUser,
  userLogin,
  addSong,
} = require("../Controllers/UserController/UserController.js");
const { verifyJWT } = require("../Middlewares/authMiddleware.js");

const userRoute = require("express").Router();

userRoute.post("/add", registerUser);
userRoute.post("/login", userLogin);
userRoute.post("/addSong", verifyJWT, addSong);

module.exports = userRoute;
