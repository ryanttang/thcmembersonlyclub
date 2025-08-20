import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/utils";
import { uploadToS3 } from "@/lib/s3";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export const runtime = "nodejs"; // ensure Node APIs for local file writes

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return new Response("No file", { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = (file.type.split("/")[1] || "bin").replace(/[^a-z0-9]/gi, "");
  const key = `flyers/${randomUUID()}.${ext}`;

  if (process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID) {
    const url = await uploadToS3(buffer, key, file.type);
    return Response.json({ url });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, `${randomUUID()}.${ext}`);
  fs.writeFileSync(filePath, buffer);
  const url = `/uploads/${path.basename(filePath)}`;
  return Response.json({ url });
}
