import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { withCors } from "@/lib/cors";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const product = await Product.findById(params.id).populate("category");
  return withCors(NextResponse.json(product));
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const product = await Product.findByIdAndUpdate(params.id, body, { new: true });
  return withCors(NextResponse.json(product));
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  await Product.findByIdAndDelete(params.id);
  return withCors(NextResponse.json({ success: true }));
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
