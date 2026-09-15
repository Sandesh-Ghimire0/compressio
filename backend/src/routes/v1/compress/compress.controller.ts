import { ApiError } from "../../../utils/apiError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { compressService } from "./compress.service.js";
import fs from "fs";
import { ApiResponse } from "../../../utils/apiResponse.js";
import { progressEmitter } from "./compress.event.js";
import path from "path";

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

    const filesMetaData = files.map((file, i) => {
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

    await compressService.compressAndArchive(filesMetaData);
    return res
        .status(200)
        .json(new ApiResponse(200, [], "Videos added to the queue"));
});

export const sendProgress = asyncHandler(async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders(); // send header immediately to the client

    progressEmitter.on("compress", (data) => {
        res.write(`event: progress\ndata: ${JSON.stringify(data)}\n\n`);
    });

    progressEmitter.on("end", (data) => {
        res.write(`event: end\ndata: ${JSON.stringify(data)}\n\n`);
    });

    req.on("close", () => {
        progressEmitter.removeAllListeners();
    });
});
