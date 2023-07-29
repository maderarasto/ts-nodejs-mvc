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
    factory: () => Controller
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

    async dispatch(route: Route, req: ExpressRequest, res: ExpressResponse) {
        if (!this.controllerFactories.has(route.controller)) {
            throw new Error(`Controller '${route.controller}' not found in controllers directory!`);
        }

        const controller = this.controllerFactories.get(route.controller)?.factory();

        if (!controller) {
            throw new Error('Error occured during creating a controller instance');
        }

        controller.setRequest(req);
        controller.setResponse(res);

        // TODO: handle all middlewares

        if (!Reflect.has(controller, route.action)) {
            throw new Error(`Action '${route.action}' not found in controller '${controller.constructor.name}'`);
        }

        const controllerAction = Reflect.get(controller, route.action) as Function;
        await controllerAction.call(controller);
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
                factory: () => {
                    const controllerCls = require(controllerFile).default;
                    return new controllerCls();
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