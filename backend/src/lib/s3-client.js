import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

export async function generatePresignedUploadUrl(userId, sessionId) {
  const key = `audio/${userId}/${sessionId}.webm`;

  try {
    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: "audio/webm",
      }),
      { expiresIn: 3600 },
    );

    return { url, key };
  } catch (error) {
    throw new Error(`Failed to generate upload URL: ${error.message}`);
  }
}
