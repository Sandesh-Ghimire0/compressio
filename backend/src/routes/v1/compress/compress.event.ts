import { EventEmitter } from "node:events";
import { videoQueueEvents } from "./compress.queue.js";
import { JobData } from "./compress.type.js";

export const progressEmitter = new EventEmitter();

videoQueueEvents.on("progress", ({ jobId, data }) => {
    console.log("Data : ", data);

    progressEmitter.emit("compress", {
        jobId: data.jobId,
        progress: data.progress,
    });
});

videoQueueEvents.on("completed", ({ jobId, returnvalue }) => {
    console.log("retured valued: ",returnvalue);
});
