import App from "../App";

export type ServiceClass = {
    new (app: App): Service
}

export default abstract class Service extends Object {
    constructor(private app: App) {
        super();
    }
}