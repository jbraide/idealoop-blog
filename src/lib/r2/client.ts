import { S3Client } from "@aws-sdk/client-s3";

// Cloudflare R2 configuration - Hardcoded with correct account ID
const r2Config = {
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucketName: process.env.R2_BUCKET_NAME || "blog-media",
  publicUrl: "https://pub-2bb6d85ec7244887aa273ab5621bc794.r2.dev",
};

// Create S3-compatible client for Cloudflare R2
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2Config.accessKeyId!,
    secretAccessKey: r2Config.secretAccessKey!,
  },
});

export { r2Config };
