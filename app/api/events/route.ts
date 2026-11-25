import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TrackEvent from "@/models/TrackEvent";
import { withCors } from "@/lib/cors";

const ALLOWED = ["Visit", "ViewContent", "AddToCart", "InitiateCheckout", "Purchase"];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !ALLOWED.includes(body.event)) {
    return withCors(NextResponse.json({ error: "Invalid event" }, { status: 400 }));
  }

  await connectDB();
  await TrackEvent.create({
    event: body.event,
    visitorId: String(body.visitorId || "").slice(0, 20),
    source: String(body.source || "direct").slice(0, 60),
    page: String(body.page || "").slice(0, 200),
    label: body.label ? String(body.label).slice(0, 120) : undefined,
    value: typeof body.value === "number" ? body.value : undefined,
  });

  return withCors(NextResponse.json({ ok: true }, { status: 201 }));
}

export async function GET() {
  await connectDB();
  const [matrix, recent] = await Promise.all([
    TrackEvent.aggregate([
      { $group: { _id: { event: "$event", source: "$source" }, count: { $sum: 1 } } },
    ]),
    TrackEvent.find().sort({ createdAt: -1 }).limit(60),
  ]);
  return withCors(NextResponse.json({ matrix, recent }));
}

export async function DELETE() {
  await connectDB();
  await TrackEvent.deleteMany({});
  return withCors(NextResponse.json({ ok: true }));
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
