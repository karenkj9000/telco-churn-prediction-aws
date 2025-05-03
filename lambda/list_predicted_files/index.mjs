import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const bucketName = process.env.BUCKET_NAME;
const folderPrefix = process.env.FOLDER_PREFIX;

const s3 = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: folderPrefix,
    });

    const response = await s3.send(command);
    const files = (response.Contents || [])
      .map((item) => item.Key.replace(folderPrefix, ""))
      .filter((name) => name.endsWith(".csv"));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // CORS header
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ files }),
    };
  } catch (err) {
    console.error("Error listing files:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // CORS header
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ error: "Failed to list files" }),
    };
  }
};