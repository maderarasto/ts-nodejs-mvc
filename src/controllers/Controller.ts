import { Request, Response as ExpressResponse, CookieOptions } from "express";

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

export class Response {
    constructor(private response: ExpressResponse) {}

    hasHeader(name: string): boolean {
        return this.response.hasHeader(name);
    }

    clearCookie(name: string) {
        this.response.clearCookie(name);
    }

    header(name: string, value: string) {
        this.response.header(name, value);
        return this;
    }

    cookie(name: string, value: string, options: CookieOptions = {}) {
        this.response.cookie(name, value, options);
        return this;
    }

    render(view: string, data?: object) {
        this.response.render(view, data, (err, html) => {
            if (err) {
                throw err;
            }

            this.response.send(html);
        })
    }

    redirect(path: string) {
        this.response.redirect(path);
    }

    send(body?: any, status: number = 200) {
        this.response.status(status);
        this.response.send(body)
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

        const func = Reflect.get(this, action) as Function;
        await func.call(this, req);        
        
        this._response = undefined;
        console.log(res);
    }

    protected get response(): Response {
        return new Response(this._response as ExpressResponse);
    }
}