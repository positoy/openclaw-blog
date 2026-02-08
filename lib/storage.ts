import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.BUCKET_REGION || "auto",
  endpoint: process.env.BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: process.env.BUCKET_FORCE_PATH_STYLE === "true",
});

const BUCKET_NAME = process.env.BUCKET_NAME || "";

/**
 * Upload a file to the S3 bucket.
 */
export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

/**
 * Generate a presigned URL for reading a file (valid for 1 hour by default).
 */
export async function getPresignedUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }),
    { expiresIn },
  );
}

/**
 * Check if a file exists in the bucket.
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }),
    );
    return true;
  } catch {
    return false;
  }
}
