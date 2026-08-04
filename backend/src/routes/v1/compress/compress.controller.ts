import { EventEmitter } from "stream";
import { ApiError } from "../../../utils/apiError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { compressService, progressEmitter } from "./compress.service.js";
import fs from "fs";

export const compressVideo = asyncHandler(async (req, res) => {
    const files = req.files as Express.Multer.File[];

    // should always be array even if there is only one jobId
    // because later in forEach() loop jobIds[i] is being used
    let jobIds = req.body.jobIds;
    if (typeof jobIds === "string") {
        jobIds = [jobIds];
    }

    // TODO : validation of files and jobIds presence

    const jobs = new Map<string, Express.Multer.File>();

    files.forEach((file, i) => {
        jobs.set(jobIds[i], file);
    });

    if (jobs) {
        const results = await compressService.compressBatch(jobs);
        res.attachment("compressed-videos.zip");
        await compressService.archiveAndStreamCompressedVideos(results, res);

        results.forEach((r) => {
            fs.unlink(r.inputPath, () => {});
            fs.unlink(r.outputPath, () => {});
        });
    } else {
        throw new ApiError(400, "Files not available");
    }
});

export const sendProgress = asyncHandler(async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const { jobId } = req.params;

    if (typeof jobId === "string") {
        progressEmitter.on(jobId, (data) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        });
    } else {
        throw new ApiError(400, "jobId should be string, invalid format");
    }

    req.on("close", () => {
        progressEmitter.removeAllListeners(jobId as string);
    });
});
