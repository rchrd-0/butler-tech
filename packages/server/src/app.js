import cors from "cors";
import express from "express";
import { evlog } from "#/lib/logger.js";

const corsOrigin = process.env.CORS_ORIGIN?.trim();

const app = express();

app.use(evlog());
app.use(
  cors({
    origin: corsOrigin || false,
    methods: ["GET"],
  }),
);

app.get("/health", (req, res) => {
  req.log.set({
    module: "health",
  });

  res.json({
    message: "OK",
    uptime: process.uptime(),
  });
});

app.use((_req, res) => {
  res.status(404).json({
    message: "Not found",
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  req.log.error(error);

  const statusCode = error.statusCode ?? error.status;

  const status =
    Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 600 ? statusCode : 500;

  res.status(status).json({
    message: status >= 500 ? "Internal server error" : error.message,
  });
});

export default app;
