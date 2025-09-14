// api/src/server.js
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";
import routes from "./routes/games.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ---------- Middlewares ---------- */
// Sert le dossier public/ à la racine (index.html, css, js, assets, …)
app.use(express.static(path.resolve(__dirname, "../public")));

app.use(cors());
app.use(express.json());                   // JSON (fetch/axios)
app.use(express.urlencoded({ extended: true })); // <form> HTML (x-www-form-urlencoded)
app.use(morgan("dev"));

/* ---------- API ---------- */
// Index API (liste les endpoints)
app.get("/api", (_req, res) => {
  res.json({
    ok: true,
    message: "Game API",
    endpoints: [
      "GET    /api",
      "GET    /api/health",
      "GET    /api/ping",
      "GET    /api/games",
      "POST   /api/games",
      "GET    /api/games/:id",
      "PUT    /api/games/:id",
      "DELETE /api/games/:id",
    ],
  });
});

// Health route (déplacée pour ne pas écraser / qui doit servir index.html)
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "game-api" }));

// Ping debug
app.get("/api/ping", (_req, res) => res.json({ pong: true }));

// Routes métier
app.use("/api/games", routes);

/* ---------- Gestion erreurs ---------- */
// Erreurs Mongoose -> 400
app.use((err, req, res, next) => {
  if (err?.name === "ValidationError") {
    return res.status(400).json({ error: err.message, details: err.errors });
  }
  if (err?.name === "CastError") {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  }
  return next(err);
});

// Handler global
app.use((err, req, res, _next) => {
  console.error("API error:", err);
  res.status(500).json({ error: err?.message || "Internal Server Error" });
});

/* ---------- Démarrage ---------- */
const PORT = process.env.PORT || 3000;
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