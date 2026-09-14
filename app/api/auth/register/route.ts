import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { withCors } from "@/lib/cors";

export async function POST(req: NextRequest) {
  await connectDB();
  const { name, email, phone, password } = await req.json();

  if (!name || !email || !phone || !password) {
    return withCors(NextResponse.json({ error: "Missing fields" }, { status: 400 }));
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return withCors(NextResponse.json({ error: "Email already registered" }, { status: 409 }));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), phone, passwordHash });
  const token = signToken(user._id.toString());

  return withCors(NextResponse.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
  }, { status: 201 }));
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
