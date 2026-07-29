import { Router } from "express";
import { fetchArchives, generatePresignedUrl } from "./archive.controller.js";

const archiveRouter = Router();

archiveRouter.route("/").get(fetchArchives);
archiveRouter.route("/presigned-url").get(generatePresignedUrl);
export { archiveRouter };
