import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { withCors } from "@/lib/cors";

export async function GET() {
  await connectDB();
  const products = await Product.find().populate("category").sort({ createdAt: -1 });
  return withCors(NextResponse.json(products));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const product = await Product.create(body);
  return withCors(NextResponse.json(product, { status: 201 }));
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
