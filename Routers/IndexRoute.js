const IndexRoute = require("express").Router();
const userRoute = require("../Routers/UserRouter");
const songRoute = require("../Routers/SongRouter");
const genreRoute = require("../Routers/GenreRouter");
const playlistRoute = require("../Routers/PlaylistRouter");

IndexRoute.use("/v1/users", userRoute);
IndexRoute.use("/v1/songs", songRoute);
IndexRoute.use("/v1/genres", genreRoute);
IndexRoute.use("/v1/playlists", playlistRoute);

module.exports = IndexRoute;
