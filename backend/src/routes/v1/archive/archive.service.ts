import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "../../../app.js";
import { sign } from "node:crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

        return results;
    }

    async getPresingedUrl(key: string) {
        const getObjParams = {
            Bucket: process.env.S3_BUCKET,
            Key: key,
        };
        const command = new GetObjectCommand(getObjParams);
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return url;
    }
}

export const archiveService = new ArchiveService();
