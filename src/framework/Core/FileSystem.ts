import fs from 'fs';
import path from 'path';

/**
 * Represents API for manipulating with filesystem.
 */
export default class FileSystem {
    private constructor() {

    }

    static exists(filePath: string): boolean {
        return fs.existsSync(filePath);
    }

    static isFile(filePath: string): boolean {
        const fileStat = fs.statSync(filePath);
        return fileStat.isFile();
    }

    static isDirectory(filePath: string): boolean {
        const fileStat = fs.statSync(filePath);
        return fileStat.isDirectory();
    }

    static basename(filePath: string): string {
        return path.basename(filePath);
    }

    static extension(filePath: string): string {
        return path.extname(filePath);
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

    static makeDirectory(dir: string, options?: fs.Mode | fs.MakeDirectoryOptions | null) {
        return fs.mkdirSync(dir, options);
    }

}