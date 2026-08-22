import { Worker } from "bullmq";
import { ARCHIVE_QUEUE_NAME } from "./archive.queue.js";
import { redisConnection } from "../../../config/redis.js";

const archiveWorker = new Worker(
    ARCHIVE_QUEUE_NAME,
    async (job) => {

        const childrenValues = await job.getChildrenValues();
        const outputs = Object.values(childrenValues);

        console.log("outputs : ", outputs);

        // archive and upload to s3
    },
    {
        connection: redisConnection,
    },
);
