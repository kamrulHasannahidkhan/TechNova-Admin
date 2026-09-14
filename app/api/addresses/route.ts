import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUserIdFromRequest } from "@/lib/auth";
import { withCors } from "@/lib/cors";

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));

  await connectDB();
  const body = await req.json();
  const user = await User.findById(userId);
  if (!user) return withCors(NextResponse.json({ error: "Not found" }, { status: 404 }));

  user.addresses.push(body);
  await user.save();

  return withCors(NextResponse.json(user.addresses, { status: 201 }));
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
