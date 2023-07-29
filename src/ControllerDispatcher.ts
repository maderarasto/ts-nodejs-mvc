import fs from 'fs';
import os from 'os';
import path from 'path';

import {
    Request as ExpressRequest,
    Response as ExpressResponse
} from 'express';

import Controller, { Route } from "./controllers/Controller";
import config from './config';
import App from './App';

type ControllerFactory = {
    path: string,
    factory: () => Promise<Controller>
};

export default class ControllerDispatcher {
    private static readonly ABSTRACT_CONTROLLER_NAME = 'Controller';
    private static readonly CONTROLLERS_FILE_EXT = '.ts';
    private static readonly CONTROLLERS_DIR = path.join(config.srcDir, 'controllers');

    private controllerFactories: Map<string, ControllerFactory>;

    constructor(private app: App) {
        this.controllerFactories = new Map();

        this.loadControllers();
    }

    dispatch(route: Route, req: ExpressRequest, res: ExpressResponse) {

    }

    private loadControllers() {
        if (!fs.existsSync(ControllerDispatcher.CONTROLLERS_DIR)) {
            throw new Error('Required directory for controllers not found!');
        }

        const dirFiles = this.getFiles(ControllerDispatcher.CONTROLLERS_DIR, true);
        const controllerFiles = dirFiles.filter(filePath => {
            const fileExt = path.extname(filePath);
            const fileName = path.basename(filePath);

            return fileExt === ControllerDispatcher.CONTROLLERS_FILE_EXT 
                && fileName.includes(ControllerDispatcher.ABSTRACT_CONTROLLER_NAME) 
                && fileName !== `${ControllerDispatcher.ABSTRACT_CONTROLLER_NAME}.${ControllerDispatcher.CONTROLLERS_FILE_EXT}`;
        });

        controllerFiles.forEach(controllerFile => {
            const controllerKey = this.resolveControllerKey(controllerFile);
            const controllerFactory: ControllerFactory = {
                path: controllerFile,
                factory: async () => {
                    const controllerCls = require(controllerFile).default;
                    return new controllerCls(this.app)                    ;
                }
            };
            
            this.controllerFactories.set(controllerKey, controllerFactory);
        });
    }

    private resolveControllerFile(filePath: string) {
        let result = filePath;

        if (os.platform() === 'win32') {
            result = `file:///${filePath}`;
        }

        return result;
    }

    private resolveControllerKey(controllerFile: string) {
        let controllerKey = controllerFile.replace(ControllerDispatcher.CONTROLLERS_DIR + path.sep, '');
        controllerKey = controllerKey.replaceAll('\\', '/');
        controllerKey = controllerKey.replace(ControllerDispatcher.CONTROLLERS_FILE_EXT, '');

        return controllerKey;
    }

    private getFiles(dir: string, recursive=false): string[] {
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
                        ...this.getFiles(itemPath, recursive)
                    ];
                } 

                return;
            }

            dirFiles.push(itemPath);
        });

        return dirFiles;
    }
}