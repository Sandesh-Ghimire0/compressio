import { Queue, QueueEvents } from "bullmq";
import { redisConnection } from "../../../config/redis.js";

export const VIDEO_QUEUE_NAME = "video-compression";

export const videoQueue = new Queue(VIDEO_QUEUE_NAME, {
    connection: redisConnection,
});

export const videoQueueEvents = new QueueEvents(VIDEO_QUEUE_NAME, {
    connection: redisConnection,
});
