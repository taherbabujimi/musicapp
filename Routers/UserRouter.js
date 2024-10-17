const {
  registerUser,
  userLogin,
} = require("../Controllers/UserController/UserController.js");

const userRoute = require("express").Router();

userRoute.post("/add", registerUser);
userRoute.post("/login", userLogin);

module.exports = userRoute;
