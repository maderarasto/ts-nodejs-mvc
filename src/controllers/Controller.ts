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
}