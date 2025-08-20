import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const hasS3 = !!process.env.S3_BUCKET && !!process.env.S3_ACCESS_KEY_ID;

export const s3 = hasS3
  ? new S3Client({
      region: process.env.S3_REGION!,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export async function uploadToS3(file: Buffer, key: string, contentType: string) {
  if (!s3) throw new Error("S3 not configured");
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: "public-read",
    })
  );
  const base = process.env.S3_PUBLIC_BASE_URL || `https://${process.env.S3_BUCKET}.s3.amazonaws.com`;
  return `${base}/${key}`;
}
