import { asyncHandler } from "../../../utils/asyncHandler.js";

export const compressVideo = asyncHandler((req, res) => {
    console.log("Compressing.........");

    return res.status(200).json({ message: "upload success" });
});
