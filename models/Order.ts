import mongoose, { Schema } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    status: { type: String, enum: ["cart", "ordered"], required: true, default: "cart" },
    orderStatus: {
      type: String,
      enum: ["waiting", "confirmed", "processing", "cancelled"],
      default: "waiting",
    },
    items: [OrderItemSchema],
    customer: {
      fullName: String,
      phone: String,
      email: String,
      address: String,
      district: String,
      notes: String,
    },
    shippingOption: String,
    shippingCost: Number,
    subtotal: Number,
    total: Number,
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
