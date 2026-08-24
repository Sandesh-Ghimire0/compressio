import "dotenv/config";
import { Redis } from "ioredis";

export const redisConnection = new Redis({
    host: process.env.REDIS_HOST,
    port: 6379,
    maxRetriesPerRequest: null,
});
