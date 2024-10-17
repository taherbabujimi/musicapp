const { addRole } = require("../Controllers/roleController");
const { verifyJWT } = require("../Middlewares/authMiddleware");
const {
  verifyUsertypeAndPermission,
} = require("../Middlewares/verifyUsertypeAndPermission");

const roleRoute = require("express").Router();

roleRoute.post(
  "/addRole",
  verifyJWT,
  verifyUsertypeAndPermission(["superAdmin"]),
  addRole
);

module.exports = roleRoute;
