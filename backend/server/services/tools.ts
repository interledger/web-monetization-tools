import fs from "fs/promises"
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3"

export const defaultDataPath = "data/default_config.json"

export const getS3AndParams = (walletAddress: string) => {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
  })

  const fileKey = `${walletAddress
    .replace("$", "")
    .replace("https://", "")}.json`

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey
  }

  return { s3, params }
}

export const getDefaultData = async () => {
  const data = await fs.readFile(defaultDataPath, {
    encoding: "utf8"
  })
  return data
}

// Function to convert a stream to a string
export const streamToString = (readableStream: NodeJS.ReadableStream): Promise<string> => {
    return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        readableStream.on("data", (chunk) => chunks.push(chunk));
        readableStream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        readableStream.on("error", reject);
    });
};
