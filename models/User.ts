import mongoose, { Schema } from "mongoose";

const AddressSchema = new Schema(
  {
    label: { type: String, default: "Home" },
    fullName: String,
    phone: String,
    address: String,
    district: String,
  },
  { _id: true }
);

const CartItemSchema = new Schema(
  {
    productId: String,
    name: String,
    price: Number,
    image: String,
    quantity: Number,
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    addresses: [AddressSchema],
    cart: [CartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
