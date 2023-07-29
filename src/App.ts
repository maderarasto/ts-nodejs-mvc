import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import moment from 'moment';
import path from 'path';
import fs from 'fs';

import session, { Store } from 'express-session';
import { Liquid } from 'liquidjs';
import config from './config';

import DB from './database/DB';
import Controller, { Route } from './controllers/Controller';
import Middleware from './middlewares/Middleware';
import { ErrorHandler } from './utils';
import { Service } from './services';
import ControllerDispatcher from './ControllerDispatcher';

declare module 'express-session' {
    interface SessionData {
        userId?: number
    }
}

const FileStore = require('session-file-store')(session);
const MySQLStore = require('express-mysql-session')(session);

type SessionDriver = 'file' | 'database';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type AppComponent = 'service';

export default class App {
    private static readonly SESSION_STORES: Record<SessionDriver, Store> = {
        file: new FileStore({
            path: config.session.files,
            //ttl: moment.duration(config.session.lifetime, 'minutes').asSeconds()
            ttl: 60,
            reapInterval: moment.duration(15, 'minutes').asSeconds()
        }),

        database: new MySQLStore({
            host: config.database.credentials.host,
            user: config.database.credentials.user,
            pass: config.database.credentials.password,
            database: config.database.credentials.database,
            expiration: moment.duration(config.session.lifetime, 'minutes').asMilliseconds(),
        })
    };


    private static instance: App;

    private app: express.Express;
    private controllerDispatcher: ControllerDispatcher;
    private middlewares: Middleware[];

    constructor() {
        this.app = express();
        this.controllerDispatcher = new ControllerDispatcher(this);
        this.middlewares = [];

        // Set up render engine
        this.app.engine('liquid', new Liquid().express());
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.set('view engine', 'liquid');

        // Set up sessions
        this.app.use(session({
            store: App.SESSION_STORES[config.session.driver],
            secret: config.session.secret,
            saveUninitialized: true,
            resave: false
        }))
    }

    // public getComponent(type: AppComponent, name: string) {
    //     let component = null;

    //     if (type === 'service' && this.services.has(name)) {
    //         component = this.services.get(name);
    //     }

    //     return component;
    // }

    public start() {
        DB.init();

        if (config.session.driver === 'file') {
            if (!fs.existsSync(path.join(__dirname, 'storage/sessions'))) {
                fs.mkdirSync(path.join(__dirname, 'storage/sessions'));
            }
        }

        this.app.listen(config.port, () => {
            console.log(`App is listening on port ${config.port}...`);
        })
    }

    // private getExpressCallback(method: HttpMethod): Function {
    //     const callbackKey = method.toLowerCase() ?? '';

    //     if (!Reflect.has(this.app, callbackKey)) {
    //         throw new Error('Given function doesn\'t exist on express applicaiton object!');
    //     }

    //     const callback = Reflect.get(this.app, method.toLowerCase()) as Function;
    //     return callback.bind(this.app);
    // }

    // private async handleRequest(route: Route, req: ExpressRequest, res: ExpressResponse) {
    //     const controller = this.controllers.get(route.controller.name);

    //     if (!controller) {
    //         // TODO: warn about not found controller
    //         return;
    //     }

    //     try {
    //         const blocked = this.middlewares.some((middleware) => {
    //             return !middleware.handle(req, res);
    //         });

    //         if (blocked) {
    //             return;
    //         }

    //         await controller.call(route.action, req, res);
    //     } catch (err) {
    //         new ErrorHandler().handle(err as Error, res);
    //     }
    // }
}