import { FlowProducer, Queue, QueueEvents } from "bullmq";
import { redisConnection } from "../../../config/redis.js";

export const VIDEO_QUEUE_NAME = "video-compression";

export const videoQueueEvents = new QueueEvents(VIDEO_QUEUE_NAME, {
    connection: redisConnection,
});

export const flowProducer = new FlowProducer({ connection: redisConnection });
