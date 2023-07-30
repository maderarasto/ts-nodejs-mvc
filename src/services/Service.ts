import App from "../App";
import Injectable from "../interfaces/Injectable";

export type ServiceClass = {
    new (app: App): Service
}

export default abstract class Service extends Object implements Injectable {
    constructor(private app: App) {
        super();
    }
}