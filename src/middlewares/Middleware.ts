import App from "../App";

export default class Middleware extends Object {
    constructor(private app: App) {
        super();
    }

    handle(): boolean {
        return true;
    }
}