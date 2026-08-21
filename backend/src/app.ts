import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { S3Client } from "@aws-sdk/client-s3";
import "./routes/v1/compress/compress.worker.js"; // without this worker will not execute

export const app = express();

export const s3Client = new S3Client({ region: process.env.AWS_REGION });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
    }),
);
app.use(express.static("public"));
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

// -------------------------------------------------
import { v1Router } from "./routes/v1/index.js";
import path from "path";

app.use("/api/v1", v1Router);

// on reload displays the static index.html page instead rendering routes of express backend
if (process.env.NODE_ENV === "production") {
    app.use((req, res) => {
        res.sendFile(path.join(__dirname, "..", "public", "index.html"));
    });
}
