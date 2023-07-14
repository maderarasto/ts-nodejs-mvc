import { Request, Response } from "express";

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

export default abstract class Controller extends Object {
    constructor() {
        super();
    }

    // GET
    public index(request: Request, response: Response) {

    }

    // GET
    public get(request: Request, response: Response) {

    }

    // POST
    public create(request: Request, response: Response) {

    }

    // PUT|PATCH
    public update(request: Request, response: Response) {

    }

    // DELETE
    public delete(request: Request, response: Response) {

    }
}