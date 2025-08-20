import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/utils";
import { uploadToS3 } from "@/lib/s3";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export const runtime = "nodejs"; // ensure Node APIs for local file writes

// Upload restrictions
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_DIMENSIONS = 1920; // Max width/height in pixels
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return new Response("No file", { status: 400 });

  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return new Response("Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.", { 
      status: 400 
    });
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return new Response(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`, { 
      status: 400 
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Validate image dimensions
  try {
    const dimensions = await getImageDimensions(buffer);
    if (dimensions.width > MAX_IMAGE_DIMENSIONS || dimensions.height > MAX_IMAGE_DIMENSIONS) {
      return new Response(
        `Image dimensions too large. Maximum dimensions are ${MAX_IMAGE_DIMENSIONS}x${MAX_IMAGE_DIMENSIONS} pixels.`, 
        { status: 400 }
      );
    }
  } catch {
    return new Response("Invalid image file or unable to read dimensions.", { status: 400 });
  }

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

// Helper function to get image dimensions
async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  // For JPEG, PNG, WebP, and GIF, we can read the header to get dimensions
  // This is a simplified approach - in production you might want to use a proper image library
  
  if (buffer.length < 8) {
    throw new Error("File too small to be a valid image");
  }

  // Check file signatures
  const signature = buffer.subarray(0, 8);
  
  // JPEG: starts with FF D8 FF
  if (signature[0] === 0xFF && signature[1] === 0xD8 && signature[2] === 0xFF) {
    return getJPEGDimensions(buffer);
  }
  
  // PNG: starts with 89 50 4E 47 0D 0A 1A 0A
  if (signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4E && signature[3] === 0x47) {
    return getPNGDimensions(buffer);
  }
  
  // WebP: starts with 52 49 46 46 (RIFF) followed by WebP
  if (signature[0] === 0x52 && signature[1] === 0x49 && signature[2] === 0x46 && signature[3] === 0x46) {
    return getWebPDimensions(buffer);
  }
  
  // GIF: starts with 47 49 46 38 (GIF8)
  if (signature[0] === 0x47 && signature[1] === 0x49 && signature[2] === 0x46 && signature[3] === 0x38) {
    return getGIFDimensions(buffer);
  }
  
  throw new Error("Unsupported image format");
}

function getJPEGDimensions(buffer: Buffer): { width: number; height: number } {
  let i = 2;
  while (i < buffer.length - 2) {
    if (buffer[i] === 0xFF && buffer[i + 1] === 0xC0) {
      const height = (buffer[i + 5] << 8) | buffer[i + 6];
      const width = (buffer[i + 7] << 8) | buffer[i + 8];
      return { width, height };
    }
    i += 2 + ((buffer[i + 2] << 8) | buffer[i + 3]);
  }
  throw new Error("Could not read JPEG dimensions");
}

function getPNGDimensions(buffer: Buffer): { width: number; height: number } {
  if (buffer.length < 24) throw new Error("PNG file too small");
  
  const width = (buffer[16] << 24) | (buffer[17] << 16) | (buffer[18] << 8) | buffer[19];
  const height = (buffer[20] << 24) | (buffer[21] << 16) | (buffer[22] << 8) | buffer[23];
  
  return { width, height };
}

function getWebPDimensions(buffer: Buffer): { width: number; height: number } {
  if (buffer.length < 30) throw new Error("WebP file too small");
  
  // WebP dimensions are at different offsets depending on the format
  // This is a simplified check - in production use a proper WebP library
  const width = (buffer[26] << 8) | buffer[27];
  const height = (buffer[28] << 8) | buffer[29];
  
  return { width, height };
}

function getGIFDimensions(buffer: Buffer): { width: number; height: number } {
  if (buffer.length < 10) throw new Error("GIF file too small");
  
  const width = buffer[6] | (buffer[7] << 8);
  const height = buffer[8] | (buffer[9] << 8);
  
  return { width, height };
}
