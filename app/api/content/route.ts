import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Content from "@/models/Content";
import { withCors } from "@/lib/cors";

export async function GET(req: NextRequest) {
  await connectDB();
  const section = req.nextUrl.searchParams.get("section");
  const query = section ? { section } : {};
  const content = await Content.find(query);
  return withCors(NextResponse.json(content));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const content = await Content.create(body);
  return withCors(NextResponse.json(content, { status: 201 }));
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
