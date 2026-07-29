import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { archiveService } from "./archive.service.js";

export const fetchArchives = asyncHandler(async (req, res) => {
    const results = await archiveService.getAllVideoArchives();
    console.log(results);
    if (!results) {
        throw new ApiError(500, "Something went wrong while fetching archives");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, results, "Successfully fetched the archives"),
        );
});

export const generatePresignedUrl = asyncHandler(async (req, res) => {
    const { key } = req.query;
    if (!key) {
        throw new ApiError(400, "Key is required");
    }

    const url = await archiveService.getPresingedUrl(key as string);

    if (!url) {
        throw new ApiError(500, "Failed to generate the presinged url");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, url, "Url generated successfully"));
});
