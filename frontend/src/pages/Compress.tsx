import axios from "axios";
import { useState } from "react";

interface CustomFile {
    file: File;
    name: string;
    size: number;
    type: string;
    jobId: string;
    progress: number;
}

const Compress = () => {
    const [files, setFiles] = useState<CustomFile[]>([]);

    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<
        "idle" | "processing" | "ready" | "error"
    >("idle");

    const isDuplicate = (file: File) => {
        return files.some((f) => f.name === file.name && f.size === file.size);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);

        const newFiles = selected.filter((file) => !isDuplicate(file));

        const filesWithJobId = newFiles.map((file) => {
            return {
                file: file,
                name: file.name,
                size: file.size,
                type: file.type,
                jobId: crypto.randomUUID(),
                progress: 0,
            };
        });

        setFiles((prev) => [...prev, ...filesWithJobId]);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setStatus("processing");
        if (files.length === 0)
            return alert("Please select at least one video file");

        try {
            files.forEach((file) => {
                const eventSource = new EventSource(
                    `${import.meta.env.VITE_BACKEND_URL}/api/v1/compress/progress/${file.jobId}`,
                );
                eventSource.onmessage = function (event) {
                    const data = JSON.parse(event.data);
                    console.log(data);
                    setFiles((prev) =>
                        prev.map((f) => {
                            if (f.jobId === data.jobId) {
                                return {
                                    ...f,
                                    progress: data.progress,
                                };
                            }
                            return f;
                        }),
                    );
                };

                // TODO: add done event listerner emitted from backend

                eventSource.onerror = () => {
                    eventSource.close();
                };
            });

            const formData = new FormData();
            files.forEach((file) => {
                formData.append("jobIds", file.jobId);
                formData.append("videos", file.file);
            });

            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/compress`,
                formData,
                {
                    responseType: "blob",
                },
            );
            const url = URL.createObjectURL(res.data);

            setDownloadUrl(url);
            setStatus("ready");
        } catch (error) {
            console.log("compresssion failed: ", error);
            setStatus("error");
        }
    };

    return (
        <>
            <div className="flex justify-center mb-4">
                <div className="">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4"
                    >
                        <label
                            htmlFor="upload-file"
                            className="block text-sm font-medium text-neutral-300"
                        >
                            Upload video files
                        </label>

                        <input
                            type="file"
                            id="upload-file"
                            accept=".mp4,.mov,.avi,.mkv,.webm"
                            multiple
                            onChange={handleFileChange}
                            className="block w-full text-sm text-neutral-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-medium
                            file:bg-neutral-800 file:text-neutral-200
                            hover:file:bg-neutral-700
                            cursor-pointer"
                        />

                        <button
                            type="submit"
                            className={`w-full bg-neutral-200 text-neutral-900 font-medium
                            py-2 rounded-lg hover:bg-neutral-300 transition-colors 
                            ${status === "processing" ? "cursor-progress" : "cursor-pointer"}`}
                            disabled={status === "processing"}
                        >
                            {status === "processing"
                                ? "compressing...."
                                : "compress"}
                        </button>
                    </form>
                </div>
            </div>

            {files.length > 0 ? (
                <div>
                    <div className="flex flex-col justify-center gap-4 bg-neutral-800 p-4 rounded-md">
                        <p className="shrink-0 text-center">Uploaded files</p>
                        <ul className="grid grid-cols-3 gap-4 ">
                            {files.map((file, i) => (
                                <li
                                    key={file.jobId}
                                    className="flex flex-col gap-4 justify-between bg-neutral-700 p-4 rounded-xl"
                                >
                                    <div className="flex justify-between">
                                        <p>{file.name} </p>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            className="ml-2 text-neutral-500 hover:text-neutral-200"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="flex justify-between">
                                        <p>Type: {file.type}</p>
                                        <p>
                                            Size:{" "}
                                            {(
                                                file.size /
                                                (1024 * 1024)
                                            ).toFixed(2)}{" "}
                                            MB
                                        </p>
                                    </div>

                                    {status === "processing" && (
                                        <div className="flex items-center">
                                            <progress
                                                value={file.progress}
                                                max={100}
                                                className="bg-blue-400 flex-1"
                                            />
                                            <span className="ml-2 shrink-0">
                                                {file.progress}%
                                            </span>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    {downloadUrl && status === "ready" && (
                        <div className="text-slate-400 text-center">
                            <p>
                                Your compressed video is ready. click
                                <a
                                    href={downloadUrl}
                                    download={`compressed-${new Date().toISOString()}.zip`}
                                    className="text-blue-400 hover:underline pl-1"
                                >
                                    Downlaod
                                </a>
                            </p>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="border text-center border-red-500 bg-red-100 text-red-500 p-4">
                            Something went wrong while compressing
                        </div>
                    )}
                </div>
            ) : (
                ""
            )}
        </>
    );
};

export default Compress;
