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

import { Response } from "express";
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
                    // TODO ; stream progress to client
                    process.stdout.write(
                        `\rProgress: ${progress.percent?.toFixed(1)}%`,
                    );
                    progressEmitter.emit(jobId, {
                        progress: progress.percent?.toFixed(1),
                    });
                })
                .on("end", () => {
                    process.stdout.write("\rProgress: 100.0%\n");
                    resolve(outputPath);
                    progressEmitter.emit(jobId, {
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
        res: NodeJS.WritableStream,
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
        archive.pipe(res);

        await Promise.all([archive.finalize(), s3Upload.done()]).catch(
            (error) => {
                // TODO : Return error response
                console.log("Failed to archive :: ", error);
            },
        );
    }

    async compressBatch(files: Express.Multer.File[], jobId: string) {
        const compressPromises = files.map(async (file) => {
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
