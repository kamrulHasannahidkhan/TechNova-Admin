import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { withCors } from "@/lib/cors";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "products" }, (err, res) => (err ? reject(err) : resolve(res)))
      .end(buffer);
  });

  return withCors(NextResponse.json(result));
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
