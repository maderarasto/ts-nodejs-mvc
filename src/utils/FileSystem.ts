import fs from 'fs';
import path from 'path';

export default class FileSystem {
    private constructor() {

    }

    /**
     * Get all files of given directory. If recursive is set to true then 
     * it returns also files of all subdirectories.
     * 
     * @param dir path to directory.
     * @param recursive signal for recursive function for subdirectories.
     * @returns filepaths of found files.
     */
    static getFiles(dir: string, recursive: boolean = false): string[] {
        let dirFiles: string[] = [];
        const dirItems = fs.readdirSync(dir);
        
        dirItems.forEach(itemName => {
            const itemPath = path.join(dir, itemName);
            const itemStat = fs.statSync(itemPath);
            //console.log(itemPath, dirFiles);

            if (itemStat.isDirectory()) {
                if (recursive) {
                    dirFiles = [
                        ...dirFiles, 
                        ...FileSystem.getFiles(itemPath, recursive)
                    ];
                } 

                return;
            }

            dirFiles.push(itemPath);
        });

        return dirFiles;
    }
}