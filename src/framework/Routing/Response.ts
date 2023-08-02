import {
    Response as ExpressResponse,
    CookieOptions
} from 'express';

/**
 * Represents a response wrapper around express response object with better error handling.
 */
export default class Response {
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