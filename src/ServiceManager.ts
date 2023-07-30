import fs from 'fs';
import path from "path";

import config from "./config";
import { Service } from './interfaces';
import { FileSystem } from './utils';

export default class ServiceManager extends Object {
    /**
     * Name of abstract class for controllers.
     */
    private static readonly BASE_SERVICE_NAME = 'Service';

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

    /**
     * Get an isntance of service by given key.
     * 
     * @param key key of service
     * @returns instance of service
     */
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

    /**
     * Get instances of all services.
     * @returns instances of services
     */
    getServices(): Map<string, Service> {
        const services: Map<string, Service> = new Map();

        this.serviceFactories.forEach((serviceFactory, serviceKey) => {
            services.set(serviceKey, serviceFactory());
        });

        return services;
    }

    /**
     * Loads service factories from directory services.
     */
    private loadServices() {
        if (!fs.existsSync(ServiceManager.SERVICES_DIR)) {
            return;
        }

        const dirFiles = FileSystem.getFiles(ServiceManager.SERVICES_DIR, true);
        const serviceFiles = dirFiles.filter(filePath => {
            const fileExt = path.extname(filePath);path
            const fileName = path.basename(filePath);

            return fileExt === '.ts' 
                && fileName.includes(ServiceManager.BASE_SERVICE_NAME) 
                && fileName !== `${ServiceManager.BASE_SERVICE_NAME}.ts`;
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