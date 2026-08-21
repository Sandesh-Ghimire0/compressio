import { ApiError } from "../../../utils/apiError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { compressService } from "./compress.service.js";
import fs from "fs";
import { archiveService } from "../archive/archive.service.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import { progressEmitter } from "./compress.event.js";
import path from "path";
import { videoQueue } from "./compress.queue.js";

const compressedDir = "tmp/compressed";
if (!fs.existsSync(compressedDir)) {
    fs.mkdirSync(compressedDir, { recursive: true });
}

export const compressVideo = asyncHandler(async (req, res) => {
    const files = req.files as Express.Multer.File[];

    // should always be array even if there is only one jobId
    // because later in forEach() loop jobIds[i] is being used
    let jobIds = req.body.jobIds;
    if (typeof jobIds === "string") {
        jobIds = [jobIds];
    }

    if (jobIds.length === 0 || files.length === 0) {
        throw new ApiError(400, "Files and JobIds is required");
    }

    const jobs = files.map((file, i) => {
        return {
            jobId: jobIds[i],
            inputPath: file.path,
            outputPath: path.join(
                compressedDir,
                `compressed-${file.originalname}`,
            ),
            originalName: file.originalname,
        };
    });

    await Promise.all(jobs.map((job) => videoQueue.add("compress-video", job)));
    return res
        .status(200)
        .json(new ApiResponse(200, [], "Videos added to the queue"));

    // if (jobs) {
    //     const results = await compressService.compressBatch(jobs);

    //     // this will directly stream the response
    //     const key =
    //         await compressService.archiveAndStreamCompressedVideos(results);
    //     const preSignedURl = await archiveService.getPresingedUrl(key);

    //     results.forEach((r) => {
    //         fs.unlink(r.inputPath, () => {});
    //         fs.unlink(r.outputPath, () => {});
    //     });

    // } else {
    //     throw new ApiError(400, "Files not available");
    // }
});

export const sendProgress = asyncHandler(async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders(); // send header immediately to the client

    progressEmitter.on("compress", (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    });

    progressEmitter.on("end", (data) => {
        res.write(`data: end\n\n`);
    });

    req.on("close", () => {
        progressEmitter.removeAllListeners();
    });
});
