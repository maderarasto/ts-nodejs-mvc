import fs from 'fs';
import path from 'path';

import {
    Request as ExpressRequest,
    Response as ExpressResponse
} from 'express';

import Application from '../Core/Application';
import Controller from './Controller';
import FileSystem from '../Core/FileSystem';

/**
 * Represents a dispatcher for creating controllers and dispatching their action based on registered routes.
 */
export default class ControllerDispatcher {
    /**
     * Name of abstract class for controllers.
     */
    private static readonly ABSTRACT_CONTROLLER_NAME = 'Controller';

    /**
     * Directory in which are controller files located.
     */
    private static controllersDir: string;

    /**
     * Factory methods for controllers binded by combination of folders and name.
     * Example of key Backend/UserController is located in controllers/Backend/UserController.ts.
     */
    private controllerFactories: Map<string, (container: Routing.ContainerDI) => Controller>;

    constructor(private app: Application) {
        this.controllerFactories = new Map();
        ControllerDispatcher.controllersDir = app.config.controllers.dir;

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
    async dispatch(route: Routing.Route, req: ExpressRequest, res: ExpressResponse) {
        if (!this.controllerFactories.has(route.controller)) {
            throw new Error(`Controller '${route.controller}' not found in controllers directory!`);
        }

        const container: Routing.ContainerDI = {};
        const services = this.app.serviceManager.getServices();

        services.forEach((service, serviceKey) => {
            const injectebleKey = serviceKey.split('/').reduce((carry, current, index) => {
                const part = index === 0 ? current[0].toLowerCase() + current.substring(1) : current;
                return carry + part;
            }, '');
            
            container[injectebleKey] = service;
        });

        const controllerFactory = this.controllerFactories.get(route.controller) as Function;
        const controller = controllerFactory(container);

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
        if (!fs.existsSync(ControllerDispatcher.controllersDir)) {
            return;
        }

        const dirFiles = FileSystem.files(ControllerDispatcher.controllersDir, true);
        const controllerFiles = dirFiles.filter(filePath => {
            const fileExt = path.extname(filePath);
            const fileName = path.basename(filePath);

            return fileExt === '.ts'
                && fileName.includes(ControllerDispatcher.ABSTRACT_CONTROLLER_NAME) 
                && fileName !== `${ControllerDispatcher.ABSTRACT_CONTROLLER_NAME}.ts`;
        });

        controllerFiles.forEach(controllerFile => {
            const controllerKey = this.resolveControllerKey(controllerFile);
            const controllerFactory = (container: Routing.ContainerDI) => {
                const controllerCls = require(controllerFile).default;
                return new controllerCls(container);
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
        let controllerKey = controllerFile.replace(ControllerDispatcher.controllersDir + path.sep, '');
        controllerKey = controllerKey.replaceAll('\\', '/');
        controllerKey = controllerKey.replace('.ts', '');

        return controllerKey;
    }
}