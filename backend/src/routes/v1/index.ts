import { Router } from "express";
import { compressRouter } from "./compress/compress.route.js";
import { archiveRouter } from "./archive/archive.route.js";

import "./compress/compress.worker.js";
import "./archive/archive.worker.js";
import "./archive/archive.events.js"

const v1Router = Router();

v1Router.use("/compress", compressRouter);
v1Router.use("/archives", archiveRouter);

export { v1Router };
