import { Request, Response as ExpressResponse } from "express";

export type ControllerClass = { 
    new (): Controller 
};

export type Route = {
    path: string,
    name?: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    controller: ControllerClass,
    action: string,
    guard?: string
}

export type ErrorResponse = {
    code: number,
    error: {
        message: string,
        callstack?: string[]
    }
}

class Response {
    constructor(private response: ExpressResponse) {

    }

    send() {
    }
}

export default abstract class Controller extends Object {
    private _response?: ExpressResponse;

    constructor() {
        super();
    }

    async call(action: string, req: Request, res: ExpressResponse) {
        this._response = res;

        if (!Reflect.has(this, action)) {
            this._response = undefined;
            throw new Error(`Action ${action} doesn't exists on controller ${this.constructor.name}!`);
        }

        const func = await Reflect.get(this, action) as Function;
        func.call(this, req);        
        this.response.
        this._response = undefined;
    }

    protected get response(): Response {
        return new Response(this._response as ExpressResponse);
    }
}