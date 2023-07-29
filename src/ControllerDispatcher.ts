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

/**
 * Represents a factory for instantiating controllers.
 */
type ControllerFactory = {
    path: string,
    factory: () => Controller
};

/**
 * Represents a dispatcher for creating controllers and dispatching their action based on registered routes.
 */
export default class ControllerDispatcher {
    /**
     * Name of abstract class for controllers.
     */
    private static readonly ABSTRACT_CONTROLLER_NAME = 'Controller';

    /**
     * Extension of controller script files.
     */
    private static readonly CONTROLLERS_FILE_EXT = '.ts';

    /**
     * Directory in which are controller files located.
     */
    private static readonly CONTROLLERS_DIR = path.join(config.srcDir, 'controllers');

    /**
     * Factory methods for controllers binded by combination of folders and name.
     * Example of key Backend/UserController is located in controllers/Backend/UserController.ts.
     */
    private controllerFactories: Map<string, ControllerFactory>;

    constructor(private app: App) {
        this.controllerFactories = new Map();

        this.loadControllers();
    }

    /**
     * Creates a controller for incoming request based on route binded to incoming request.
     * Also dispatching action registered in config.
     * 
     * @param route route binded to request.
     * @param req data associated with request.
     * @param res functionality for respoding to user.
     */
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

    /**
     * Load all controllers from controllers directory and store their factory methods in map.
     */
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

    /**
     * Resolve controller key based on combination of folders and name of controller file.
     * 
     * @param controllerFile file path to controller file.
     * @returns resolved controller key.
     */
    private resolveControllerKey(controllerFile: string) {
        let controllerKey = controllerFile.replace(ControllerDispatcher.CONTROLLERS_DIR + path.sep, '');
        controllerKey = controllerKey.replaceAll('\\', '/');
        controllerKey = controllerKey.replace(ControllerDispatcher.CONTROLLERS_FILE_EXT, '');

        return controllerKey;
    }

    /**
     * Get all files of given directory. If recursive is set to true then 
     * it returns also files of all subdirectories.
     * 
     * @param dir path to directory.
     * @param recursive signal for recursive function for subdirectories.
     * @returns filepaths of found files.
     */
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