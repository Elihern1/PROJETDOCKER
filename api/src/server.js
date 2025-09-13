// api/src/server.js
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";  
import routes from "./routes/games.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health route
app.get("/", (_req, res) => res.json({ ok: true, service: "game-api" }));

// Index API (optionnel mais pratique)
app.get("/api", (_req, res) => {
  res.json({
    ok: true,
    message: "Game API",
    endpoints: [
      "GET    /",
      "GET    /api",
      "GET    /api/ping",
      "GET    /api/games",
      "POST   /api/games",
      "GET    /api/games/:id",
      "PUT    /api/games/:id",
      "DELETE /api/games/:id"
    ]
  });
});

// Routes métier
app.use("/api/games", routes);

// Ping debug
app.get("/api/ping", (_req, res) => res.json({ pong: true }));

// Erreurs de validation/cast Mongoose -> 400
app.use((err, req, res, next) => {
  if (err?.name === "ValidationError") {
    return res.status(400).json({ error: err.message, details: err.errors });
  }
  if (err?.name === "CastError") {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  }
  return next(err); // laisse le global 500 gérer le reste
});
// Error handler global (attrape les erreurs des handlers async)
app.use((err, req, res, _next) => {
  console.error("API error:", err);
  res.status(500).json({ error: err?.message || "Internal Server Error" });
});

// ---- Config & démarrage ----
const PORT = process.env.PORT || 3000;
// En local hors Docker, exporter MONGO_URI="mongodb://localhost:27017/gamesdb"
const DEFAULT_URI = "mongodb://mongo:27017/gamesdb";
const MONGO_URI = process.env.MONGO_URI || DEFAULT_URI;

async function start() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("Mongo connected:", MONGO_URI);
    app.listen(PORT, "0.0.0.0", () => console.log(`API on :${PORT}`));
  } catch (err) {
    console.error("Mongo connection error:", err.message);
    process.exit(1);
  }
}

start();
