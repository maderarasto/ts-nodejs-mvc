import {
    Request as ExpressRequest, 
    Response as ExpressResponse
} from 'express'

import App from "../Core/Application";

export default abstract class Middleware {
    constructor(private app: App) {
    }

    abstract handle(req: ExpressRequest, res: ExpressResponse): boolean;
}