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
