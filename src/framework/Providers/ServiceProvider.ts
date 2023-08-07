import Application from "../Core/Application";
import FactoryLoader from "../Core/FactoryLoader";
import Provider from "../Core/Interfaces/Provider";

export default class ServiceProvider 
    extends FactoryLoader<Interfaces.Service> 
    implements Provider<string, Interfaces.Service> {

    constructor(app: Application) {
        super('Service', app.config.services.dir);
    }

    get(key: string): Interfaces.Service {
        if (!this.componentFactory.has(key)) {
            throw new Error(`Service '${key}' not found in services directory!`);
        }

        const serviceFactory = this.componentFactory.get(key) as Function;
        const service = serviceFactory();

        if (!service) {
            throw new Error('Error occured during creating a service instance');
        }

        return service;
    }
    all(): Map<string, Interfaces.Service> {
        const services: Map<string, Interfaces.Service> = new Map();

        this.componentFactory.forEach((serviceFactory, serviceKey) => {
            services.set(serviceKey, serviceFactory());
        })

        return services;
    }

}