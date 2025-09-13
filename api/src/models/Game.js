import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Un titre est nécéssaire"],
      trim: true,
      minlength: [2, "Le titre doit faire au moins 2 caractères"],
      maxlength: [120, "Le titre ne peut pas dépasser 120 caractères"],
    },
    platform: {
      type: String,
      required: [true, "Une plateforme est nécéssaire"],
      trim: true,
      enum: {
        values: ["PC", "PlayStation", "Xbox", "Switch", "Mobile", "Autre"],
        message: "Plateforme invalide",
      },
    },
    genre: {
      type: String,
      default: "Inconnu",
      trim: true,
    },
    price: {
      type: Number,
      min: [0, "Le prix ne peut pas être négatif"],
      default: 0,
    },
    releaseDate: {
      type: Date,
      required: [true, "release date is required"]
    },
    rating: {
      type: Number,
      min: [0, "La note doit être au moins 0"],
      max: [10, "La note ne peut pas dépasser 10"],
    },
    date: {
      type: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Game", gameSchema);
