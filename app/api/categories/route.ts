import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { withCors } from "@/lib/cors";

export async function GET() {
  await connectDB();
  const categories = await Category.find().sort({ name: 1 });
  return withCors(NextResponse.json(categories));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const category = await Category.create(body);
  return withCors(NextResponse.json(category, { status: 201 }));
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
