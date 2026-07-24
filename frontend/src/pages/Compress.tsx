import axios from "axios";
import { useState } from "react";

const Compress = () => {
    const [files, setFiles] = useState<File[]>([]);

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
        if (files.length === 0)
            return alert("Please select at least one video file");
        // TODO: send files to your backend/API here

        const formData = new FormData();
        files.forEach((file) => {
            formData.append("videos", file);
        });

        const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/compress`,
            formData,
        );
        if (res.status === 200) {
            console.log("Upload successfull");
        }
    };

    return (
        <div className="flex items-center justify-center px-4">
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

                {files.length > 0 && (
                    <ul className="space-y-1 max-h-40 overflow-y-auto">
                        {files.map((file, i) => (
                            <li
                                key={`${file.name}-${i}`}
                                className="flex items-center justify-between text-xs text-neutral-400 bg-neutral-800 rounded-md px-3 py-2"
                            >
                                <span className="truncate">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    className="ml-2 text-neutral-500 hover:text-neutral-200"
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <button
                    type="submit"
                    className="w-full bg-neutral-200 text-neutral-900 font-medium
            py-2 rounded-lg hover:bg-neutral-300 transition-colors"
                >
                    Compress {files.length > 0 && `(${files.length})`}
                </button>
            </form>
        </div>
    );
};

export default Compress;
