import fs from 'fs';
import path from "path";

import config from "./config";
import { Service } from './services';
import { FileSystem } from './utils';

export default class ServiceManager extends Object {
    /**
     * Name of abstract class for controllers.
     */
    private static readonly ABSTRACT_SERVICE_NAME = 'Service';

    /**
     * List of files that will not be loaded to manager.
     */
    private static readonly IGNORED_SCRIPT_FILES = [ 
        `index.ts`, 
        `${this.ABSTRACT_SERVICE_NAME}.ts`]

    /**
     * Directory in which are controller files located.
     */
    private static readonly SERVICES_DIR = path.join(config.srcDir, 'services');
    
    /**
     * Factory methods for controllers binded by combination of folders and name.
     * Example of key Backend/UserController is located in controllers/Backend/UserController.ts.
     */
    private serviceFactories: Map<string, () => Service>;
    
    constructor() {
        super();

        this.serviceFactories = new Map();
        this.loadServices();
    }

    getService(key: string): Service {
        if (!this.serviceFactories.has(key)) {
            throw new Error(`Service '${key}' not found in services directory!`);
        }

        const serviceFactory = this.serviceFactories.get(key) as Function;
        const service = serviceFactory();

        if (!service) {
            throw new Error('Error occured during creating a service instance');
        }

        return service;
    }

    private loadServices() {
        if (!fs.existsSync(ServiceManager.SERVICES_DIR)) {
            throw new Error('Required directory for controllers not found!');
        }

        const dirFiles = FileSystem.getFiles(ServiceManager.SERVICES_DIR, true);
        const serviceFiles = dirFiles.filter(filePath => {
            const fileExt = path.extname(filePath);path
            const fileName = path.basename(filePath);

            return fileExt === '.ts' 
                && fileName.includes(ServiceManager.ABSTRACT_SERVICE_NAME) 
                && !ServiceManager.IGNORED_SCRIPT_FILES.includes(fileName);
        });

        serviceFiles.forEach(serviceFile => {
            const serviceKey = this.resolveServiceKey(serviceFile);
            const serviceFactory = () => {
                const serviceCls = require(serviceFile).default;
                return new serviceCls();
            };
            
            this.serviceFactories.set(serviceKey, serviceFactory);
        });
    }

    /**
     * Resolve controller key based on combination of folders and name of controller file.
     * 
     * @param controllerFile file path to controller file.
     * @returns resolved controller key.
     */
    private resolveServiceKey(serviceFile: string) {
        let serviceKey = serviceFile.replace(ServiceManager.SERVICES_DIR + path.sep, '');
        serviceKey = serviceKey.replaceAll('\\', '/');
        serviceKey = serviceKey.replace('.ts', '');

        return serviceKey;
    }
}