import axios from "axios";
import { Download, FolderArchive } from "lucide-react";
import { useEffect, useState } from "react";

interface Archive {
    key: string;
    size: number;
    lastModified: string;
}

const Archive = () => {
    const [archives, setArchives] = useState<Archive[]>([]);

    const generatePresingedUrl = async (key: string) => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/archives/presigned-url?key=${key}`,
            );

            if (res.data.statusCode === 200) {
                const a = document.createElement("a");
                a.href = res.data.data;
                a.download = key;

                a.click();
            }
        } catch (error) {
            console.log("Error while generating presigned URL :: ", error);
        }
    };

    const fetchArchives = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/archives`,
            );

            if (res.data.statusCode === 200) {
                setArchives(res.data.data);
            }
        } catch (error) {
            console.log("Error fetching archives :: ", error);
        }
    };

    useEffect(() => {
        fetchArchives();
    }, []);
    return (
        <div>
            <ul className="grid grid-cols-2 gap-4">
                {archives.length === 0 ? (
                    <div className="text-md text-slate-400">
                        No archives available
                    </div>
                ) : (
                    archives.map((a) => {
                        return (
                            <li
                                key={a.key}
                                className="bg-neutral-800 rounded-xl p-4 flex flex-col gap-4"
                            >
                                <div className="flex justify-between">
                                    <div className="flex gap-2">
                                        <FolderArchive />
                                        <p>{a.key}</p>
                                    </div>
                                    <div
                                        className="cursor-pointer hover:bg-blue-400 hover:rounded-full"
                                        onClick={() =>
                                            generatePresingedUrl(a.key)
                                        }
                                    >
                                        <Download color="lightblue" />
                                    </div>
                                </div>

                                <p>
                                    size; {(a.size / (1024 * 1024)).toFixed(2)}{" "}
                                    MB
                                </p>
                                <p>
                                    Created At:{" "}
                                    {new Date(a.lastModified).toDateString()}
                                </p>
                            </li>
                        );
                    })
                )}
            </ul>
        </div>
    );
};

export default Archive;
