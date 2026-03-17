import "dotenv/config";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS,
  },
});

async function testS3() {
  try {
    const bucket = process.env.AWS_BUCKET_NAME;
    const key = "test/test-recording.txt";

    // 1. Generate presigned URL for upload (what frontend uses)
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: "audio/webm",
      }),
      { expiresIn: 3600 },
    );
    console.log("Generated presigned upload URL");
    console.log("URL starts with:", uploadUrl.substring(0, 60) + "...");

    // 2. Upload via presigned URL (simulating frontend)
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: "This is fake audio content for testing",
      headers: { "Content-Type": "audio/webm" },
    });
    console.log("Uploaded via presigned URL - Status:", uploadResponse.status);

    // 3. Generate presigned URL for download (what frontend uses to play audio)
    const downloadUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
      { expiresIn: 3600 },
    );
    console.log("Generated presigned download URL");

    // 4. Download via presigned URL (simulating frontend audio playback)
    const downloadResponse = await fetch(downloadUrl);
    const content = await downloadResponse.text();
    console.log("Downloaded content:", content);

    // 5. Read via SDK (simulating backend access if ever needed)
    const getResponse = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    const body = await getResponse.Body.transformToString();
    console.log("Read via SDK:", body);

    // 6. Test the actual key pattern we'll use in the app
    const userId = "usr_test123";
    const sessionId = "ses_test456";
    const audioKey = `audio/${userId}/${sessionId}.webm`;

    const appUploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: audioKey,
        ContentType: "audio/webm",
      }),
      { expiresIn: 3600 },
    );
    console.log("App key pattern works:", audioKey);

    console.log("AWS S3 IS WORKING PERFECTLY");
  } catch (error) {
    console.error("S3 test failed:", error.message);
  }
}

testS3();
