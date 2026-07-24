import { ApiError } from "../../../utils/apiError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { compressService } from "./compress.service.js"

export const compressVideo = asyncHandler(async (req, res) => {
    const files = req.files as Express.Multer.File[];

    if (files) {
        const results = await compressService.compressBatch(files);
        console.log(results);
    } else {
        throw new ApiError(400, "Files not available");
    }

    return res.status(200).json({ message: "upload success" });
});
