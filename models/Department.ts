import mongoose, { Schema } from "mongoose";

const DepartmentSchema = new Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Department || mongoose.model("Department", DepartmentSchema);
