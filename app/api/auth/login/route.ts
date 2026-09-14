import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { withCors } from "@/lib/cors";

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, password } = await req.json();

  const user = await User.findOne({ email: (email || "").toLowerCase() });
  if (!user) {
    return withCors(NextResponse.json({ error: "Invalid email or password" }, { status: 401 }));
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return withCors(NextResponse.json({ error: "Invalid email or password" }, { status: 401 }));
  }

  const token = signToken(user._id.toString());

  return withCors(NextResponse.json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  }));
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
