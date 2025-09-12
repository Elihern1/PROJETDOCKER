import { Router } from "express";
import Game from "../models/Game.js";

const r = Router();

r.get("/", async (_req, res) => {
  const items = await Game.find().lean();
  res.json(items);
});

r.get("/:id", async (req, res) => {
  const item = await Game.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

r.post("/", async (req, res) => {
  const created = await Game.create(req.body);
  res.status(201).json(created);
});

r.put("/:id", async (req, res) => {
  const updated = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

r.delete("/:id", async (req, res) => {
  await Game.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

export default r;
