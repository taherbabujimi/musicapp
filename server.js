const cluster = require("cluster");
const os = require("os");

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running.`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("fork", (worker) => {
    console.log("worker is dead:", worker.isDead());
  });

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker process ${worker.process.pid} died. Restarting...`);
    const newWorker = cluster.fork();
    console.log("worker ", newWorker.id, " live");
  });
} else {
  require("dotenv").config();
  const { client } = require("./config/redis");
  const IndexRoute = require("./Routers/IndexRoute");
  const Express = require("express");
  const app = Express();

  // defining port
  const port = process.env.PORT || 7000;

  // For parsing the express payloads
  app.use(Express.json());
  app.use(Express.urlencoded({ extended: true }));

  // CORS permission
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    next();
  });

  app.use("/", IndexRoute);

  client
    .connect()
    .then(() => {
      app.listen(port, () => {
        console.log("Server started on port ", port);
        console.log("DB connected to ", process.env.DB_HOST);
      });
    })
    .catch((err) => {
      console.log("Error while connecting to redis: ", err);
    });
}
