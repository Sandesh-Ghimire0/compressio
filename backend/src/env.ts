import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["production", "development"]),
    PORT: z.coerce.number().default(8000),
    FRONTEND_URL: z.url(),
    AWS_REGION: z.string(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    S3_BUCKET: z.string(),
    REDIS_URL: z.url(),
});

export const ENV = envSchema.parse(process.env);
