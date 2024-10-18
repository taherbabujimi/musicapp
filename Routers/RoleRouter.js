const { addRole } = require("../Controllers/roleController");
const { verifyJWT } = require("../Middlewares/authMiddleware");
const {
  verifyUsertypeAndPermission,
} = require("../Middlewares/verifyUsertypeAndPermission");
const { USER_TYPE } = require("../services/constants");

const roleRoute = require("express").Router();

roleRoute.post(
  "/addRole",
  verifyJWT,
  verifyUsertypeAndPermission([USER_TYPE.SUPER_ADMIN]),
  addRole
);

module.exports = roleRoute;
