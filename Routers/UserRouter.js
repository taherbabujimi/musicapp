const {
  registerUser,
  userLogin,
  addAdmin,
} = require("../Controllers/UserController/UserController.js");
const { verifyJWT } = require("../Middlewares/authMiddleware.js");
const {
  verifyUsertypeAndPermission,
} = require("../Middlewares/verifyUsertypeAndPermission.js");

const userRoute = require("express").Router();

userRoute.post("/add", registerUser);
userRoute.post("/login", userLogin);
userRoute.post(
  "/addAdmin",
  verifyJWT,
  verifyUsertypeAndPermission(["superAdmin"]),
  addAdmin
);

module.exports = userRoute;
