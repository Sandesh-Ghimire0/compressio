import { Router } from "express";
import { fetchArchives } from "./archive.controller.js";


const archiveRouter = Router();

archiveRouter.route("/").get(fetchArchives);

export { archiveRouter };
