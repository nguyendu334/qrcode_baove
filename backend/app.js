const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const guardRoutes = require("./routes/guardRoutes");

const pointRoutes = require("./routes/pointRoutes");

const patrolRoutes = require("./routes/patrolRoutes");

const roundRoutes = require("./routes/roundRoutes");

const app = express();

app.set("trust proxy", true);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Security Patrol API is running",
  });
});

app.use("/api/guards", guardRoutes);

app.use("/api/points", pointRoutes);

app.use("/api/patrol", patrolRoutes);

app.use("/api/rounds", roundRoutes);

module.exports = app;
