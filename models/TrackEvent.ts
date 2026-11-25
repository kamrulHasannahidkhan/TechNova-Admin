import mongoose, { Schema } from "mongoose";

// Events delete themselves after 30 days so they never fill your free database
const TrackEventSchema = new Schema({
  event: { type: String, required: true },
  visitorId: String,
  source: { type: String, default: "direct" },
  page: String,
  label: String,
  value: Number,
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
});

export default mongoose.models.TrackEvent || mongoose.model("TrackEvent", TrackEventSchema);
