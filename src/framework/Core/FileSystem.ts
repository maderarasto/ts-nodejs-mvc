import fs, { Mode, PathLike } from 'fs';
import path from 'path';

type MakeDirectoryOptions = fs.MakeDirectoryOptions & { recursive: true};

/**
 * Represents API for manipulating with filesystem.
 */
export default class FileSystem {
    private constructor() {

    }

    static exists(path: PathLike): boolean {
        return fs.existsSync(path);
    }

    static isDirectory(path: PathLike): boolean {
        const fileStat = fs.statSync(path);
        return fileStat.isDirectory();
    }

    /**
     * Get all files of given directory. If recursive is set to true then 
     * it returns also files of all subdirectories.
     * 
     * @param dir path to directory.
     * @param recursive signal for recursive function for subdirectories.
     * @returns filepaths of found files.
     */
    static files(dir: string, recursive: boolean = false): string[] {
        let dirFiles: string[] = [];
        const dirItems = fs.readdirSync(dir);
        
        dirItems.forEach(itemName => {
            const filePath = path.join(dir, itemName);

            if (FileSystem.isDirectory(filePath)) {
                if (recursive) {
                    dirFiles = [
                        ...dirFiles, 
                        ...FileSystem.files(filePath, recursive)
                    ];
                } 

                return;
            }

            dirFiles.push(filePath);
        });

        return dirFiles;
    }

    static makeDirectory(path: PathLike, options?: fs.Mode | fs.MakeDirectoryOptions | null) {
        return fs.mkdirSync(path, options);
    }

}