import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { withCors } from "@/lib/cors";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const body = await req.json();
  const product = await Product.findByIdAndUpdate(id, body, { new: true });
  return withCors(NextResponse.json(product));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  await Product.findByIdAndDelete(id);
  return withCors(NextResponse.json({ success: true }));
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
