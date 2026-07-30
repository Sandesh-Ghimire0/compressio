import axios from "axios";
import { useState } from "react";

const Compress = () => {
    const [files, setFiles] = useState<File[]>([]);

    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<
        "idle" | "processing" | "ready" | "error"
    >("idle");
    const [progress, setProgress] = useState(0);

    const isDuplicate = (file: File) => {
        return files.some((f) => f.name === file.name && f.size === file.size);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);

        const newFiles = selected.filter((file: File) => !isDuplicate(file));

        setFiles((prev) => [...prev, ...newFiles]);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setStatus("processing");
        if (files.length === 0)
            return alert("Please select at least one video file");
        // TODO: send files to your backend/API here

        try {
            const jobId = crypto.randomUUID();
            const eventSource = new EventSource(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/compress/progress/${jobId}`,
            );
            eventSource.onmessage = function (event) {
                const data = JSON.parse(event.data);
                console.log(data)
                setProgress(data);
            };

            eventSource.onerror = () => {
                eventSource.close();
            };

            const formData = new FormData();
            files.forEach((file) => {
                formData.append("videos", file);
            });
            formData.append("jobId", jobId);

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
                            className="w-full bg-neutral-200 text-neutral-900 font-medium
                    py-2 rounded-lg hover:bg-neutral-300 transition-colors"
                            disabled={status === "processing"}
                        >
                            {status === "processing"
                                ? "compressing...."
                                : "compress"}
                        </button>
                    </form>
                </div>
            </div>

            <div>
                <div className="bg-neutral-800 p-4 rounded-md">
                    <div className="flex w-full items-center justify-between gap-4">
                        <p className="shrink-0">Uploaded files</p>
                        <div className="flex items-center flex-1">
                            <progress
                                value={progress}
                                max={100}
                                className="bg-blue-400 flex-1"
                            />
                            <span className="ml-2 shrink-0">{progress}%</span>
                        </div>
                    </div>
                    <ul className="grid grid-cols-3 gap-4 ">
                        {files.map((file, i) => (
                            <>
                                <li className="flex flex-col gap-4 justify-between bg-neutral-700 p-4 rounded-xl">
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

                                    {/* {status === "idle" ? (
                                        
                                    ) : (
                                        <p className="text-slate-400 text-xs">
                                            29%
                                        </p>
                                    )} */}
                                </li>
                            </>
                        ))}
                    </ul>
                </div>
                {downloadUrl && status === "ready" && (
                    <div className="text-slate-400">
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
                    <div className="border border-red-500 bg-red-100 text-red-500 p-4">
                        Something went wrong while compressing
                    </div>
                )}
            </div>
        </>
    );
};

export default Compress;
