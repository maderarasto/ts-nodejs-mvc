import { 
    Request as ExpressRequest, 
    Response as ExpressResponse, 
    CookieOptions 
} from "express";

import App from "../App";

export type Route = {
    path: string,
    name?: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    controller: string,
    action: string,
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
    private _request?: ExpressRequest;

    constructor() {
        super();
    }

    setRequest(req: ExpressRequest) {
        this._request = req;
    }

    setResponse(res: ExpressResponse) {
        this._response = res;
    }

    protected get request(): ExpressRequest {
        return this._request as ExpressRequest;
    }

    protected get response(): Response {
        return new Response(this._response as ExpressResponse);
    }
}