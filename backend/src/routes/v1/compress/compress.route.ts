import { Router } from "express";
import { upload } from "./compress.middleware.js";
import { compressVideo } from "./compress.controller.js";

const compressRouter = Router();

compressRouter.route("/").post(upload.array('videos'), compressVideo);

export { compressRouter };
