const {
  registerUser,
  userLogin,
  registerAdmin,
} = require("../Controllers/UserController/UserController.js");
const { verifyJWT } = require("../Middlewares/authMiddleware.js");
const {
  verifyUsertypeAndPermission,
} = require("../Middlewares/verifyUsertypeAndPermission.js");
const { USER_TYPE } = require("../services/constants");

const userRoute = require("express").Router();

userRoute.post("/add", registerUser);
userRoute.post("/login", userLogin);
userRoute.post(
  "/registerAdmin",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.SUPER_ADMIN]),
  registerAdmin
);

module.exports = userRoute;
