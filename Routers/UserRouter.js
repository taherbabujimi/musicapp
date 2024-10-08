const {getListOfUsers, getUserDataFromId, createUser, deleteUser} =  require("../Controllers/UserController/UserController.js");

const userRoute = require("express").Router();

userRoute.get("/all", getListOfUsers);
userRoute.get("/:id", getUserDataFromId);
userRoute.delete("/:id", deleteUser);
userRoute.post("/add", createUser);

module.exports =  userRoute;
