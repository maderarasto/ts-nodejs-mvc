import { 
    Request as ExpressRequest, 
    Response as ExpressResponse, 
} from "express";

import Response from "./Response";
import Authentificator from "../Auth/Authenticator";

/**
 * Represents a base controller that offers to access request data and functionality for responding to user.
 */
export default abstract class Controller {
    private _response?: ExpressResponse;
    private _request?: ExpressRequest;
    private _auth?: Authentificator;
    private _containerDI: Routing.ContainerDI;

    constructor(containerDI: Routing.ContainerDI = {}) {
        this._containerDI = containerDI;
    }

    /**
     * Set an express request object for currently processed request.
     * @param req data associated with request
     */
    setRequest(req: ExpressRequest) {
        this._request = req;
        this._auth = new Authentificator(req);
    }

    /**
     * Set an express response object for currently processed request.
     * @param res functionality for responding to user.
     */
    setResponse(res: ExpressResponse) {
        this._response = res;
    }

    protected get containerDI(): Routing.ContainerDI {
        return this._containerDI;
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

    protected get auth(): Authentificator|undefined {
        return this._auth;
    }
}