import Application from "../Core/Application";
import FactoryLoader from "../Core/FactoryLoader";
import Controller from "./Controller";
import Dispatcher from "./Interfaces/Dispatcher";

export default class ControllerDispatcher extends FactoryLoader<Controller> implements Dispatcher {
    constructor(private app: Application) {
        super('Controller', app.config.controllers.dir);
    }
    
    async dispatch(route: Routing.Route, req: Express.Request, res: Express.Response): Promise<void> {
        if (!this.componentFactory.has(route.controller)) {
            throw new Error(`Controller '${route.controller}' not found in controllers directory!`);
        }

        const container: Routing.ContainerDI = {};
        const services = this.app.serviceProvider.all();

        services.forEach((service, serviceKey) => {
            const injectebleKey = serviceKey.split('/').reduce((carry, current, index) => {
                const part = index === 0 ? current[0].toLowerCase() + current.substring(1) : current;
                return carry + part;
            }, '');
            container[injectebleKey] = service;
        });

        const controllerFactory = this.componentFactory.get(route.controller) as Function;
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

}