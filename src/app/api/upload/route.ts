import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/utils";
import { uploadToS3 } from "@/lib/s3";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { IMAGE_CONFIG, AllowedImageType } from "@/config/images";

export const runtime = "nodejs"; // ensure Node APIs for local file writes

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return new Response("No file", { status: 400 });

  // Validate file type
  if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type as AllowedImageType)) {
    return new Response("Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.", { 
      status: 400 
    });
  }

  // Validate file size
  if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
    return new Response(`File too large. Maximum size is ${IMAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB.`, { 
      status: 400 
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Validate image dimensions
  try {
    const dimensions = await getImageDimensions(buffer);
    if (dimensions.width > IMAGE_CONFIG.MAX_DIMENSIONS.width || dimensions.height > IMAGE_CONFIG.MAX_DIMENSIONS.height) {
      return new Response(
        `Image dimensions too large. Maximum dimensions are ${IMAGE_CONFIG.MAX_DIMENSIONS.width}x${IMAGE_CONFIG.MAX_DIMENSIONS.height} pixels.`, 
        { status: 400 }
      );
    }
  } catch {
    return new Response("Invalid image file or unable to read dimensions.", { status: 400 });
  }

  const baseKey = `flyers/${randomUUID()}`;
  
  try {
    // Process and resize images
    const processedImages = await processAndResizeImages(buffer);
    
    console.log("Image processing completed. Generated sizes:", Object.keys(processedImages));
    
    if (process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID) {
      // Upload all sizes to S3
      const urls = await uploadAllSizesToS3(processedImages, baseKey);
      console.log("Images uploaded to S3:", urls);
      return Response.json({ 
        url: urls.medium, // Return medium size as main URL for better display
        urls, // Include all sizes for different contexts
        message: "Images processed and uploaded successfully"
      });
    } else {
      // Save all sizes locally
      const urls = await saveAllSizesLocally(processedImages, baseKey);
      console.log("Images saved locally:", urls);
      return Response.json({ 
        url: urls.medium, // Return medium size as main URL for better display
        urls, // Include all sizes for different contexts
        message: "Images processed and saved successfully"
      });
    }
  } catch (error) {
    console.error("Error processing images:", error);
    return new Response("Error processing images", { status: 500 });
  }
}

// Process and resize images to multiple sizes
async function processAndResizeImages(buffer: Buffer) {
  const results: { [key: string]: Buffer } = {};
  
  // Get original image dimensions first
  let originalDimensions: { width: number; height: number };
  try {
    originalDimensions = await getImageDimensions(buffer);
  } catch (error) {
    console.error("Error getting original dimensions:", error);
    // Fallback to original buffer if we can't get dimensions
    results.original = buffer;
    return results;
  }
  
  // Process each size
  for (const [sizeName, config] of Object.entries(IMAGE_CONFIG.SIZES)) {
    try {
      if ('width' in config && 'height' in config) {
        // Calculate dimensions while maintaining aspect ratio
        const { width: targetWidth, height: targetHeight } = config;
        const originalAspectRatio = originalDimensions.width / originalDimensions.height;
        const targetAspectRatio = targetWidth / targetHeight;
        
        let finalWidth: number = targetWidth;
        let finalHeight: number = targetHeight;
        
        // If original image is smaller than target, don't upscale
        if (originalDimensions.width <= targetWidth && originalDimensions.height <= targetHeight) {
          finalWidth = originalDimensions.width;
          finalHeight = originalDimensions.height;
        } else {
          // Maintain aspect ratio while fitting within target dimensions
          if (originalAspectRatio > targetAspectRatio) {
            // Original is wider, fit to width
            finalWidth = targetWidth;
            finalHeight = Math.round(targetWidth / originalAspectRatio);
          } else {
            // Original is taller, fit to height
            finalHeight = targetHeight;
            finalWidth = Math.round(targetHeight * originalAspectRatio);
          }
        }
        
        // Resize image with proper fit strategy
        const resizedBuffer = await sharp(buffer)
          .resize(finalWidth, finalHeight, {
            fit: 'inside', // Use 'inside' to maintain aspect ratio without cropping
            withoutEnlargement: true // Don't upscale if original is smaller
          })
          .jpeg({ 
            quality: config.quality, 
            progressive: true,
            mozjpeg: true // Better compression
          })
          .toBuffer();
        
        results[sizeName] = resizedBuffer;
        console.log(`Created ${sizeName} size: ${finalWidth}x${finalHeight}`);
      } else {
        // Keep original size but optimize
        const optimizedBuffer = await sharp(buffer)
          .jpeg({ 
            quality: config.quality, 
            progressive: true,
            mozjpeg: true
          })
          .toBuffer();
        
        results[sizeName] = optimizedBuffer;
        console.log(`Created ${sizeName} size: ${originalDimensions.width}x${originalDimensions.height} (optimized)`);
      }
    } catch (error) {
      console.error(`Error processing ${sizeName} size:`, error);
      // Fallback to original buffer if resizing fails
      results[sizeName] = buffer;
    }
  }
  
  return results;
}

// Upload all image sizes to S3
async function uploadAllSizesToS3(processedImages: { [key: string]: Buffer }, baseKey: string) {
  const urls: { [key: string]: string } = {};
  
  for (const [sizeName, buffer] of Object.entries(processedImages)) {
    const key = `${baseKey}_${sizeName}.jpg`;
    const url = await uploadToS3(buffer, key, 'image/jpeg');
    urls[sizeName] = url;
  }
  
  return urls;
}

// Save all image sizes locally
async function saveAllSizesLocally(processedImages: { [key: string]: Buffer }, baseKey: string) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  
  try {
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log("Created uploads directory:", uploadsDir);
    }
    
    const urls: { [key: string]: string } = {};
    
    for (const [sizeName, buffer] of Object.entries(processedImages)) {
      try {
        const fileName = `${baseKey}_${sizeName}.jpg`;
        const filePath = path.join(uploadsDir, fileName);
        
        fs.writeFileSync(filePath, buffer);
        urls[sizeName] = `/uploads/${fileName}`;
        
        console.log(`Saved ${sizeName} image:`, filePath, `(${buffer.length} bytes)`);
      } catch (error) {
        console.error(`Error saving ${sizeName} image:`, error);
        // Continue with other sizes even if one fails
      }
    }
    
    return urls;
  } catch (error) {
    console.error("Error creating uploads directory:", error);
    throw error;
  }
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
