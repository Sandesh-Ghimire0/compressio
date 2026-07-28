import { Router } from "express";
import { compressRouter } from "./compress/compress.route.js";
import { archiveRouter } from "./archive/archive.route.js";

const v1Router = Router();

v1Router.use("/compress", compressRouter);
v1Router.use("/archives", archiveRouter);

export { v1Router };
