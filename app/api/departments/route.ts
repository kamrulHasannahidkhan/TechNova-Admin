import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Department from "@/models/Department";
import { withCors } from "@/lib/cors";

export async function GET() {
  await connectDB();
  const departments = await Department.find().sort({ order: 1 });
  return withCors(NextResponse.json(departments));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const department = await Department.create(body);
  return withCors(NextResponse.json(department, { status: 201 }));
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
