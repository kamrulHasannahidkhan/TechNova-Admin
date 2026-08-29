import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Perk from "@/models/Perk";
import { withCors } from "@/lib/cors";

export async function GET() {
  await connectDB();
  const perks = await Perk.find().sort({ order: 1 });
  return withCors(NextResponse.json(perks));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const perk = await Perk.create(body);
  return withCors(NextResponse.json(perk, { status: 201 }));
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
