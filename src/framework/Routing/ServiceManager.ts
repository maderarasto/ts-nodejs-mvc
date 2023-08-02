import path from "path";

import Application from '../Core/Application';
import FileSystem from "../Core/FileSystem";

export default class ServiceManager extends Object {
    /**
     * Name of abstract class for controllers.
     */
    private static readonly BASE_SERVICE_NAME = 'Service';

    /**
     * Directory in which are controller files located.
     */
    private static servicesDir: string;
    
    /**
     * Factory methods for controllers binded by combination of folders and name.
     * Example of key Backend/UserController is located in controllers/Backend/UserController.ts.
     */
    private serviceFactories: Map<string, () => Interfaces.Service>;
    
    constructor(private app: Application) {
        super();

        ServiceManager.servicesDir = app.config.services.dir;

        this.serviceFactories = new Map();
        this.loadServices();
    }

    /**
     * Get an isntance of service by given key.
     * 
     * @param key key of service
     * @returns instance of service
     */
    getService(key: string): Interfaces.Service {
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
    getServices(): Map<string, Interfaces.Service> {
        const services: Map<string, Interfaces.Service> = new Map();

        this.serviceFactories.forEach((serviceFactory, serviceKey) => {
            services.set(serviceKey, serviceFactory());
        });

        return services;
    }

    /**
     * Loads service factories from directory services.
     */
    private loadServices() {
        if (!FileSystem.exists(ServiceManager.servicesDir)) {
            return;
        }

        const dirFiles = FileSystem.files(ServiceManager.servicesDir, true);
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
        let serviceKey = serviceFile.replace(ServiceManager.servicesDir + path.sep, '');
        serviceKey = serviceKey.replaceAll('\\', '/');
        serviceKey = serviceKey.replace('.ts', '');

        return serviceKey;
    }
}