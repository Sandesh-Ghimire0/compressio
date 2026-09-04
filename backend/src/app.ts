import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { ENV } from "./env.js";

export const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
    cors({
        origin: ENV.FRONTEND_URL,
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
if (ENV.NODE_ENV === "production") {
    app.use((req, res) => {
        res.sendFile(path.join(__dirname, "..", "public", "index.html"));
    });
}
