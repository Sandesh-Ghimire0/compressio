import "dotenv/config";

import { spawn } from "node:child_process";
import path from "node:path";
import fs from "fs";
import { ApiError } from "../../../utils/apiError.js";
import { ZipArchive } from "archiver";
import { S3Client } from "@aws-sdk/client-s3";
import { PassThrough } from "node:stream";
import { Upload } from "@aws-sdk/lib-storage";
import { arch } from "node:os";
import { s3Client } from "../../../app.js";
const compressedDir = "tmp/compressed";
if (!fs.existsSync(compressedDir)) {
    fs.mkdirSync(compressedDir, { recursive: true });
}

class CompressService {
    ffmpegCompress(inputPath: string, outputPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const args = [
                "-i",
                inputPath,
                "-c:v",
                "libx264",
                "-crf",
                "28",
                "-preset",
                "medium",
                "-c:a",
                "aac",
                "-b:a",
                "128k",
                "-y",
                outputPath,
            ];

            const proc = spawn("ffmpeg", args);

            let stderrOutput = "";
            proc.stderr.on("data", (chunk) => {
                stderrOutput += chunk.toString();
            });

            proc.on("close", (code) => {
                if (code === 0) {
                    resolve(outputPath);
                } else {
                    reject(
                        new ApiError(
                            500,
                            `FFmpeg exited with code ${code}: ${stderrOutput.slice(-500)}`,
                        ),
                    );
                }
            });

            proc.on("error", (err) => {
                reject(err);
            });
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

    async compressBatch(files: Express.Multer.File[]) {
        const compressPromises = files.map(async (file) => {
            const outputPath = path.join(
                compressedDir,
                `compressed-${file.originalname}`,
            );
            await this.ffmpegCompress(file.path, outputPath);
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
