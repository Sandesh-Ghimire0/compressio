import { ApiError } from "../../../utils/apiError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { compressService, progressEmitter } from "./compress.service.js";
import fs from "fs";
import { archiveService } from "../archive/archive.service.js";
import { ApiResponse } from "../../../utils/apiResponse.js";

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

    const jobs = new Map<string, Express.Multer.File>();

    files.forEach((file, i) => {
        jobs.set(jobIds[i], file);
    });

    if (jobs) {
        const results = await compressService.compressBatch(jobs);
        res.attachment("compressed-videos.zip");

        // this will directly stream the response
        const key =
            await compressService.archiveAndStreamCompressedVideos(results);
        const preSignedURl = await archiveService.getPresingedUrl(key);

        results.forEach((r) => {
            fs.unlink(r.inputPath, () => {});
            fs.unlink(r.outputPath, () => {});
        });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    preSignedURl,
                    "Compressed completed and URL generated",
                ),
            );
    } else {
        throw new ApiError(400, "Files not available");
    }
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
