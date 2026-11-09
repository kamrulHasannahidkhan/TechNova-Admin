import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  const key = process.env.INTERNAL_API_KEY;
  if (!key || req.headers.get("x-api-key") !== key) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = (req.nextUrl.searchParams.get("email") || "").toLowerCase();
  if (!email) return NextResponse.json([]);

  await connectDB();
  const orders = await Order.find({ status: "ordered", userEmail: email })
    .sort({ createdAt: -1 })
    .select("orderNumber orderStatus items total shippingCost shippingOption paymentMethod createdAt");

  return NextResponse.json(orders);
}
