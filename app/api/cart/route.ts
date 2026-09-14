import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUserIdFromRequest } from "@/lib/auth";
import { withCors } from "@/lib/cors";

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));

  await connectDB();
  const user = await User.findById(userId);
  if (!user) return withCors(NextResponse.json({ error: "Not found" }, { status: 404 }));

  return withCors(NextResponse.json(user.cart));
}

export async function PUT(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));

  await connectDB();
  const { cart } = await req.json();
  const user = await User.findByIdAndUpdate(userId, { cart }, { new: true });
  if (!user) return withCors(NextResponse.json({ error: "Not found" }, { status: 404 }));

  return withCors(NextResponse.json(user.cart));
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
