import { ApiError } from "../../../utils/apiError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { compressService } from "./compress.service.js";
import fs from "fs";

export const compressVideo = asyncHandler(async (req, res) => {
    const files = req.files as Express.Multer.File[];

    if (files) {
        const results = await compressService.compressBatch(files);
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
