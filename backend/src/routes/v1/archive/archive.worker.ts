import { Worker } from "bullmq";
import { ARCHIVE_QUEUE_NAME } from "./archive.queue.js";
import { redisConnection } from "../../../config/redis.js";
import { ZipArchive } from "archiver";
import { PassThrough } from "node:stream";
import { Upload } from "@aws-sdk/lib-storage";
import { s3Client } from "../../../config/s3.js";
import { ENV } from "../../../env.js";

const archiveWorker = new Worker(
    ARCHIVE_QUEUE_NAME,
    async (job) => {
        const childrenValues = await job.getChildrenValues();
        const outputs = Object.values(childrenValues);

        // archive and upload to s3
        const archive = new ZipArchive();
        archive.on("error", (err) => {
            // TODO: return error response
            throw err;
        });

        for (const { outputPath, originalName } of outputs) {
            archive.file(outputPath, { name: originalName });
        }

        const s3Stream = new PassThrough();
        const s3Key = `archives/${new Date().toISOString()}-compressed-videos.zip`;

        const s3Upload = new Upload({
            client: s3Client,
            params: {
                Bucket: ENV.S3_BUCKET,
                Key: s3Key,
                Body: s3Stream,
                ContentType: "application/zip",
            },
        });

        archive.pipe(s3Stream);

        await Promise.all([archive.finalize(), s3Upload.done()]).catch(
            (error) => {
                // TODO : Return error response
                console.log("Failed to archive :: ", error);
            },
        );

        return {
            s3Key,
            outputs,
        };
    },
    {
        connection: redisConnection,
    },
);
