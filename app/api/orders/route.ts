import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { nextOrderNumber } from "@/lib/orderNumber";
import { withCors } from "@/lib/cors";

export async function GET(req: NextRequest) {
  await connectDB();
  const status = req.nextUrl.searchParams.get("status");
  const query = status ? { status } : {};
  const orders = await Order.find(query).sort({ createdAt: -1 });
  return withCors(NextResponse.json(orders));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  delete body.orderNumber;
  if (body.userEmail) body.userEmail = String(body.userEmail).toLowerCase();
  if (body.status === "ordered") {
    body.orderNumber = await nextOrderNumber();
  }

  const order = await Order.create(body);
  return withCors(NextResponse.json(order, { status: 201 }));
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
