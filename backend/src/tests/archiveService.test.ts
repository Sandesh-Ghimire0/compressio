import { describe, expect, it, vi } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { s3Client } from "../config/s3.js";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { archiveService } from "../routes/v1/archive/archive.service.js";
import { beforeEach } from "node:test";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3MockClient = mockClient(s3Client);
vi.mock("@aws-sdk/s3-request-presigner", () => ({
    getSignedUrl: vi.fn(),
}));

describe("Archive Service", () => {
    beforeEach(() => {
        s3MockClient.reset();
        vi.clearAllMocks();
    });

    it("get the video archives metadata", async () => {
        // Arrange, Act and Assert

        const lastModified = new Date("2026-01-01T00:00:00Z");

        s3MockClient.on(ListObjectsV2Command).resolves({
            Contents: [
                {
                    Key: "archives/video1.mp4",
                    Size: 30000,
                    LastModified: lastModified,
                },
                {
                    Key: "archives/video2.mp4",
                    Size: 20000,
                    LastModified: lastModified,
                },
            ],
        });

        const result = await archiveService.getAllVideoArchives();

        expect(result).toEqual([
            {
                key: "archives/video1.mp4",
                size: 30000,
                lastModified: lastModified,
            },
            {
                key: "archives/video2.mp4",
                size: 20000,
                lastModified: lastModified,
            },
        ]);

        const calls = s3MockClient.commandCalls(ListObjectsV2Command);
        expect(calls).toHaveLength(1);
        expect(calls[0].args[0].input).toEqual({
            Bucket: expect.any(String),
            Prefix: "archives/",
        });
    });

    it("returns the pre-signed URL for the given key", async () => {
        vi.mocked(getSignedUrl).mockResolvedValue("https://signed-url");

        const url = await archiveService.getPresingedUrl("archives/test.mp4");
        expect(url).toBe("https://signed-url");

        // get the second argument (command) from the getSignedUrl
        // and check if the input is correct or not
        const commandArgs = vi.mocked(getSignedUrl).mock.calls[0][1];
        expect(commandArgs.input).toEqual({
            Bucket: expect.any(String),
            Key: "archives/test.mp4",
        });
    });
});
