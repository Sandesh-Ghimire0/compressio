import { Worker } from "bullmq";
import { VIDEO_QUEUE_NAME } from "./compress.queue.js";
import { redisConnection } from "../../../config/redis.js";
import ffmpeg from "fluent-ffmpeg";
import { JobData } from "./compress.type.js";

const worker = new Worker(
    VIDEO_QUEUE_NAME,
    async (job) => {
        const { inputPath, outputPath, jobId } = job.data;

        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .videoCodec("libx264")
                .outputOptions(["-crf 28", "-preset medium"])
                .audioCodec("aac")
                .audioBitrate("128k")
                .on("progress", async (progress) => {
                    await job.updateProgress({
                        jobId: jobId,
                        progress: Number(progress.percent?.toFixed(1)) || 0,
                    });
                })
                .on("end", async () => {
                    await job.updateProgress({
                        jobId: jobId,
                        progress: 100,
                    });
                    resolve(true);
                })
                .on("error", (err) => {
                    reject(err);
                    // TODO: Handle error
                })
                .save(outputPath);
        });
        return job.data;
    },
    {
        connection: redisConnection,
        concurrency: 2,
    },
);
