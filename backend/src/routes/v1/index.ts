import { Router } from "express";
import { compressRouter } from "./compress/compress.route.js";

const v1Router = Router();

v1Router.use("/compress",compressRouter)

export { v1Router };
