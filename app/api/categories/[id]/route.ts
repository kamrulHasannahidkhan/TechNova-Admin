import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { withCors } from "@/lib/cors";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const category = await Category.findByIdAndUpdate(params.id, body, { new: true });
  return withCors(NextResponse.json(category));
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  await Category.findByIdAndDelete(params.id);
  return withCors(NextResponse.json({ success: true }));
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
