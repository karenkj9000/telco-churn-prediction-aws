// getSignedDownloadURL.js
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucketName = process.env.BUCKET_NAME;
const s3 = new S3Client({ region: process.env.AWS_REGION});

export const handler = async (event) => {
  try {
    const filename = event.queryStringParameters?.filename;
    if (!filename) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing filename parameter" }),
      };
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: filename,
    });

    const downloadURL = await getSignedUrl(s3, command, { expiresIn: 300 });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ downloadURL }),
    };
  } catch (err) {
    console.error("Error generating signed URL:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate signed URL" }),
    };
  }
};

