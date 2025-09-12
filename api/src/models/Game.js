import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    platform: { type: String, default: "PC" },
    genre: { type: String, default: "Action" },
    price: { type: Number, min: 0, default: 0 },
    releaseDate: { type: Date },
    rating: { type: Number, min: 0, max: 10 },
    date: { type: Number }
  },
  { timestamps: true }
);

export default mongoose.model("Game", gameSchema);
