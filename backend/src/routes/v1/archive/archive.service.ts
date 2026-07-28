import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "../../../app.js";
import { sign } from "node:crypto";

class ArchiveService {
    async getAllVideoArchives() {
        const command = new ListObjectsV2Command({
            Bucket: process.env.S3_BUCKET,
            Prefix: "archives/",
        });

        const s3Response = await s3Client.send(command);
        const results = s3Response.Contents?.map((obj) => ({
            key: obj.Key,
            size: obj.Size,
            lastModified: obj.LastModified,
        }));

        return results
    }
}

export const archiveService = new ArchiveService();
