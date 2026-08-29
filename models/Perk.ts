import mongoose, { Schema } from "mongoose";

const PerkSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Perk || mongoose.model("Perk", PerkSchema);
