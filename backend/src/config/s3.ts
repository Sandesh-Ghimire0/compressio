import { S3Client } from "@aws-sdk/client-s3";
import { ENV } from "../env.js";

export const s3Client = new S3Client({ region: ENV.AWS_REGION });
