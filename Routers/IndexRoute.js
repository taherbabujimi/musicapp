const IndexRoute = require("express").Router();
const userRoute = require("../Routers/UserRouter");
const songRoute = require("../Routers/SongRouter");
const genreRoute = require("../Routers/GenreRouter");
const playlistRoute = require("../Routers/PlaylistRouter");
const roleRoute = require("../Routers/RoleRouter");

IndexRoute.use("/v1/users", userRoute);
IndexRoute.use("/v1/songs", songRoute);
IndexRoute.use("/v1/genres", genreRoute);
IndexRoute.use("/v1/playlists", playlistRoute);
IndexRoute.use("/v1/roles", roleRoute);

module.exports = IndexRoute;
