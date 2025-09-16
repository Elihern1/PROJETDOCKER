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
        values: ["PC", "Playstation", "Xbox", "Switch", "Mobile", "Autre"],
        message: "Plateforme invalide",
      },
    },
    genre: {
      type: String,
      default: "Inconnu",
      trim: true,
    },
    // Prix (affiché en $ dans le tableau)
    price: {
      type: Number,
      min: [0, "Le prix ne peut pas être négatif"],
      default: 0,
    },
    // Année de sortie (Number) — utilisée par le POST et pour l'affichage "Année"
    date: {
      type: Number,
      required: [true, "L'année de sortie (date) est requise"],
      min: [1950, "L'année doit être ≥ 1950"],
      max: [2100, "L'année doit être ≤ 2100"],
    },
    // Optionnel (pas affiché mais utile)
    rating: {
      type: Number,
      min: [0, "La note doit être au moins 0"],
      max: [10, "La note ne peut pas dépasser 10"],
    },
    // ✅ Disponibilité : utilisé par la colonne "En stock" + checkbox front
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Game", gameSchema);