import mongoose, { Schema } from "mongoose";

const ContentSchema = new Schema(
  {
    section: { type: String, required: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    ctaText: { type: String, default: "" },
    ctaLink: { type: String, default: "" },
    badge: { type: String, default: "" },
    discountText: { type: String, default: "" },
    contactLine: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Content || mongoose.model("Content", ContentSchema);
