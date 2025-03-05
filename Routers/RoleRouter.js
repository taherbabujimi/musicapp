const { addRole } = require("../Controllers/roleController");
const { verifyJWT } = require("../Middlewares/authMiddleware");
const { USER_TYPE } = require("../services/constants");

const roleRoute = require("express").Router();

roleRoute.post("/addRole", verifyJWT, addRole);

module.exports = roleRoute;
