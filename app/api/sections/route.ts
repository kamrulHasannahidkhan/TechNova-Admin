import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Section from "@/models/Section";
import { withCors } from "@/lib/cors";

export async function GET() {
  await connectDB();
  const sections = await Section.find().populate("category").sort({ order: 1 });
  return withCors(NextResponse.json(sections));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const section = await Section.create(body);
  return withCors(NextResponse.json(section, { status: 201 }));
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
