import { NextResponse } from "next/server";

export function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", process.env.CLIENT_APP_URL || "*");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}
