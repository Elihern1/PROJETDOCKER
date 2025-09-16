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
    const inStock =
      req.body.inStock === true ||
      req.body.inStock === "true" ||
      req.body.inStock === "on" ||
      req.body.inStock === "1";

    const game = await Game.create({
      title: req.body.title,
      platform: req.body.platform,
      genre: req.body.genre,
      price: req.body.price,
      date: Number(req.body.date),
      inStock,
      rating: req.body.rating,
    });
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
    const inStock =
      req.body.inStock === true ||
      req.body.inStock === "true" ||
      req.body.inStock === "on" ||
      req.body.inStock === "1";

    const game = await Game.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        platform: req.body.platform,
        genre: req.body.genre,
        price: req.body.price,
        date: Number(req.body.date),
        inStock, // 👈 booléen garanti
        rating: req.body.rating,
      },
      { new: true, runValidators: true }
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