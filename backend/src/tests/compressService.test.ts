import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app.js";

describe("POST /compress", () => {
    it("should add one video to the queue ", async () => {
        const res = await request(app)
            .post("/api/v1/compress")
            .field("jobIds", "12345")
            .attach("videos", "../videos/video2.mp4");
        expect(res.status).toBe(200);
        expect(res.body.message).toEqual("Videos added to the queue");
    });

    it("should add two video to the queue ", async () => {
        const res = await request(app)
            .post("/api/v1/compress")
            .field("jobIds", "12345")
            .attach("videos", "../videos/video2.mp4")
            .field("jobIds", "123443")
            .attach("videos", "../videos/video4.mp4");

        expect(res.status).toBe(200);
        expect(res.body.message).toEqual("Videos added to the queue");
    });
});
