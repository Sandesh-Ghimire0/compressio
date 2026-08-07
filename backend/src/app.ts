import express from "express";
import cors from "cors";

export const app = express();

export const s3Client = new S3Client({ region: process.env.AWS_REGION });


app.use(
    cors({
        origin: process.env.FRONTEND_URL,
    }),
);
app.use(express.static("public"))
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

// -------------------------------------------------
import { v1Router } from "./routes/v1/index.js";
import { S3Client } from "@aws-sdk/client-s3";

app.use("/api/v1", v1Router);
