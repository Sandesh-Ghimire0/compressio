import { Router } from "express";
import { upload } from "./compress.middleware.js";
import { compressVideo, sendProgress } from "./compress.controller.js";

const compressRouter = Router();

compressRouter.route("/").post(upload.array('videos'), compressVideo);
compressRouter.route("/progress/:jobId").get(sendProgress)

export { compressRouter };
