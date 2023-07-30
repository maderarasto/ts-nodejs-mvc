import { 
    Request as ExpressRequest, 
    Response as ExpressResponse, 
    CookieOptions 
} from "express";
import Injectable from "../interfaces/Injectable";

/**
 * Represents route of application that are binded to incoming requests.
 */
export type Route = {
    path: string,
    name?: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    controller: string,
    action: string,
}

/**
 * Represents error data as JSON response.
 */
export type ErrorResponse = {
    code: number,
    error: {
        message: string,
        callstack?: string[]
    }
}

/**
 * Represents a response wrapper around express response object with better error handling.
 */
export class Response {
    constructor(private response: ExpressResponse) {}

    /**
     * Check if response contains a response header.
     * @param name name of request header
     * @returns true/false
     */
    hasHeader(name: string): boolean {
        return this.response.hasHeader(name);
    }

    /**
     * Clear a specific cookie on resposne.
     * @param name name of cookie
     */
    clearCookie(name: string) {
        this.response.clearCookie(name);
    }

    /**
     * Set a response header
     * @param name name of response header
     * @param value value of response header
     * @returns response object
     */
    header(name: string, value: string) {
        this.response.header(name, value);
        return this;
    }

    /**
     * Set a response cookie.
     * @param name name of cookie
     * @param value value of cookie
     * @param options options of cookie
     * @returns response object
     */
    cookie(name: string, value: string, options: CookieOptions = {}) {
        this.response.cookie(name, value, options);
        return this;
    }

    /**
     * Render a view using template engine.
     * 
     * @param view name of view located in view directory.
     * @param data data that can be passed to rendered view.
     */
    render(view: string, data?: object) {
        this.response.render(view, data, (err, html) => {
            if (err) {
                throw err;
            }

            this.response.send(html);
        })
    }

    /**
     * Redirect response to a new route.
     * 
     * @param path path of route
     */
    redirect(path: string) {
        this.response.redirect(path);
    }

    /**
     * Send a body with given statuc code.
     * 
     * @param body body of response
     * @param status statuc code of response
     */
    send(body?: any, status: number = 200) {
        this.response.status(status);
        this.response.send(body)
    }
}

export type DIContainer = {
    [key: string]: Injectable
}

/**
 * Represents a base controller that offers to access request data and functionality for responding to user.
 */
export default abstract class Controller extends Object {
    private _response?: ExpressResponse;
    private _request?: ExpressRequest;
    private _container: DIContainer;

    constructor(container: DIContainer = {}) {
        super();

        this._container = container;
    }

    /**
     * Set an express request object for currently processed request.
     * @param req data associated with request
     */
    setRequest(req: ExpressRequest) {
        this._request = req;
    }

    /**
     * Set an express response object for currently processed request.
     * @param res functionality for responding to user.
     */
    setResponse(res: ExpressResponse) {
        this._response = res;
    }

    protected get container(): DIContainer {
        return this._container;
    }

    /**
     * Property for an express request object to access data associated with request.
     */
    protected get request(): ExpressRequest {
        return this._request as ExpressRequest;
    }

    /**
     * Property for wrapper response that offers functionality for responding to user.
     */
    protected get response(): Response {
        return new Response(this._response as ExpressResponse);
    }
}