import "dotenv/config";

import { flowProducer, VIDEO_QUEUE_NAME } from "./compress.queue.js";
import { ARCHIVE_QUEUE_NAME } from "../archive/archive.queue.js";
import { JobData } from "./compress.type.js";

class CompressService {
    async compressAndArchive(files: JobData[]) {
        await flowProducer.add({
            name: "archive-videos",
            queueName: ARCHIVE_QUEUE_NAME,
            children: files.map((file) => ({
                name: "compress-video",
                queueName: VIDEO_QUEUE_NAME,
                data: file,
            })),
        });
    }
}

export const compressService = new CompressService();
