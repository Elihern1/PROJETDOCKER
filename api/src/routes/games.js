import express from "express";
import Game from "../models/Game.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const games = await Game.find().lean();
    res.json(games);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const game = await Game.create(req.body);  // peut lever ValidationError
    res.status(201).json(game);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: "Not found" });
    res.json(game);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // runValidators important
    );
    if (!game) return res.status(404).json({ error: "Not found" });
    res.json(game);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;