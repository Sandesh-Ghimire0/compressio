import "dotenv/config";

import path from "node:path";
import fs from "fs";
import { ApiError } from "../../../utils/apiError.js";
import { ZipArchive } from "archiver";
import { EventEmitter } from "events";

import { PassThrough } from "node:stream";
import { Upload } from "@aws-sdk/lib-storage";
import { s3Client } from "../../../app.js";
import ffmpeg from "fluent-ffmpeg";

const compressedDir = "tmp/compressed";
if (!fs.existsSync(compressedDir)) {
    fs.mkdirSync(compressedDir, { recursive: true });
}

export const progressEmitter = new EventEmitter();

class CompressService {
    ffmpegCompress(
        jobId: string,
        inputPath: string,
        outputPath: string,
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .videoCodec("libx264")
                .outputOptions(["-crf 28", "-preset medium"])
                .audioCodec("aac")
                .audioBitrate("128k")
                .on("progress", (progress) => {
                    progressEmitter.emit(jobId, {
                        jobId: jobId,
                        progress: Number(progress.percent?.toFixed(1)) || 0,
                    });
                })
                .on("end", () => {
                    resolve(outputPath);
                    progressEmitter.emit(jobId, {
                        jobId: jobId,
                        progress: 100,
                    });
                })
                .on("error", (err) => {
                    reject(new ApiError(500, `FFmpeg error: ${err.message}`));
                })
                .save(outputPath);
        });
    }

    async archiveAndStreamCompressedVideos(
        files: { outputPath: string; originalName: string }[],
    ) {
        const archive = new ZipArchive();
        archive.on("error", (err) => {
            // TODO: return error response
            throw err;
        });

        for (const { outputPath, originalName } of files) {
            archive.file(outputPath, { name: originalName });
        }

        const s3Stream = new PassThrough();
        const s3Key = `archives/${new Date().toISOString()}-compressed-videos.zip`;

        const s3Upload = new Upload({
            client: s3Client,
            params: {
                Bucket: process.env.S3_BUCKET,
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

        return s3Key
    }

    async compressBatch(jobs: Map<string, Express.Multer.File>) {
        const compressPromises = [...jobs].map(async ([jobId, file]) => {
            const outputPath = path.join(
                compressedDir,
                `compressed-${file.originalname}`,
            );
            await this.ffmpegCompress(jobId, file.path, outputPath);
            return {
                outputPath,
                originalName: file.originalname,
                inputPath: file.path,
            };
        });

        const results = await Promise.all(compressPromises);
        return results;
    }
}

export const compressService = new CompressService();
