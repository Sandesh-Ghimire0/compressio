import { Queue } from "bullmq";
import { redisConnection } from "../../../config/redis.js";

export const ARCHIVE_QUEUE_NAME = "archive-video";

const archiveQueue = new Queue(ARCHIVE_QUEUE_NAME, {
    connection: redisConnection,
});
