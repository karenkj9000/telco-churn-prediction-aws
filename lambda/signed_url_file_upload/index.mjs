import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  const filename = event.queryStringParameters?.filename;
  const contentType = event.queryStringParameters?.contentType;
  if (!filename) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing 'filename' query parameter." }),
    };
  }

  if (!contentType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing 'contentType' query parameter." }),
    };
  }

  // Generate a unique key by adding a timestamp to the filename
  const timestamp = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
  const lastDotIndex = filename.lastIndexOf('.'); // Find the last dot in the filename (extension)
  const baseName = lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename; // Extract base name
  const extension = lastDotIndex !== -1 ? filename.slice(lastDotIndex) : ''; // Extract extension
  const key = `uploads/${baseName}-${timestamp}${extension}`; // Generate unique key

  const command = new PutObjectCommand({
    Bucket: process.env.uploadBucket,
    Key: key,
    ContentType: contentType,
  });

  try {
    // Generate a signed URL for putting the object in S3
    const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadURL, // Return the signed URL
        filename: key, // Return the generated filename
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate upload URL', details: err.message }),
    };
  }
};
