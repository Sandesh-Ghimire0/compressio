import { spawn } from "node:child_process";
import path from "node:path";
import fs from "fs";
import { ApiError } from "../../../utils/apiError.js";

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
