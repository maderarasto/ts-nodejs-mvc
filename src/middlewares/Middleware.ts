import {
    Request as ExpressRequest, 
    Response as ExpressResponse
} from 'express'

import App from "../App";

export type MiddlewareClass = {
    new (app: App): Middleware
}

export default abstract class Middleware extends Object {
    constructor(private app: App) {
        super();
    }

    abstract handle(req: ExpressRequest, res: ExpressResponse): boolean;
}