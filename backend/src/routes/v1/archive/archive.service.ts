import fs from "fs";
import { ZipArchive } from "archiver";

const archiveDir = "tmp/archive";
if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
}

class ArchiveService {
    
}

export const archiveService = new ArchiveService();
