import { progressEmitter } from "../compress/compress.event.js";
import { JobData } from "../compress/compress.type.js";
import { archiveQueueEvents } from "./archive.queue.js";
import { archiveService } from "./archive.service.js";
import fs from "fs";

archiveQueueEvents.on("completed", async ({ jobId, returnvalue }) => {
    const s3Key = returnvalue.s3Key;
    const outputs = returnvalue.outputs;
    const preSignedUrl = await archiveService.getPresingedUrl(s3Key);

    outputs.forEach((out: JobData) => {
        fs.unlink(out.inputPath, () => {});
        fs.unlink(out.outputPath, () => {});
    });

    progressEmitter.emit("end", {
        preSignedUrl,
    });
});
