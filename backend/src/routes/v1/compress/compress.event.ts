import { EventEmitter } from "node:events";
import { videoQueueEvents } from "./compress.queue.js";

export const progressEmitter = new EventEmitter();

videoQueueEvents.on("progress", ({ jobId, data }) => {
    progressEmitter.emit("compress", {
        jobId: (data as any).jobId,
        progress: (data as any).progress,
    });
});
