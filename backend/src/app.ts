import express from "express";
import cors from "cors";

export const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
    }),
);
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

// -------------------------------------------------
import { v1Router } from "./routes/v1/index.js";

app.use("/api/v1", v1Router);
