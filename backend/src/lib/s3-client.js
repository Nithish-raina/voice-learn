import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import logger from "./logger.js";

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS,
  },
});

export async function generatePresignedUploadUrl(userId, sessionId) {
  const key = `audio/${userId}/${sessionId}.webm`;

  try {
    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: "audio/webm",
      }),
      { expiresIn: 3600 },
    );

    return { url, key };
  } catch (error) {
    logger.error({ err: error }, "Failed to generate presigned URL");
    throw new Error("Unable to prepare audio upload. Please try again.");
  }
}
