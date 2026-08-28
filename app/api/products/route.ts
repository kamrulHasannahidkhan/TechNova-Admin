import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import "@/models/Department";
import { withCors } from "@/lib/cors";

export async function GET(req: NextRequest) {
  await connectDB();
  const departmentId = req.nextUrl.searchParams.get("department");
  const tag = req.nextUrl.searchParams.get("tag");

  const query: any = {};
  if (departmentId) query.department = departmentId;
  if (tag) query.tags = tag;

  const products = await Product.find(query).populate("department").sort({ createdAt: -1 });
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
