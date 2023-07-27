import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import moment from 'moment';
import path from 'path';
import fs from 'fs';

import session, { Store } from 'express-session';
import { Liquid } from 'liquidjs';
import config from './config';

import DB from './database/DB';
import Controller, { Route } from './controllers/Controller';
import { ErrorHandler } from './utils';

declare module 'express-session' {
    interface SessionData {
        userId?: number
    }
}

const FileStore = require('session-file-store')(session);
const MySQLStore = require('express-mysql-session')(session);

type SessionDriver = 'file' | 'database';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

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
    private controllers: Map<string, Controller>;

    private constructor() {
        this.app = express();
        this.controllers = new Map();

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

    public start() {
        DB.init();

        if (config.session.driver === 'file') {
            if (!fs.existsSync(path.join(__dirname, 'storage/sessions'))) {
                fs.mkdirSync(path.join(__dirname, 'storage/sessions'));
            }
        }

        config.controllers.forEach(controllerCls => {
            const controller = new controllerCls();

            // TODO: process controller

            // Bind routes to controller methods
            const controllerRoutes = config.routes.filter(
                ({controller}) => controller === controllerCls
            );

            controllerRoutes.forEach(route => {
                const expressCall = this.getExpressCallback(route.method);

                if (!expressCall) {
                    // TODO: Warn about no express action
                    return;
                }

                expressCall(route.path, this.handleRequest.bind(this, route));
            });

            this.controllers.set(controllerCls.name, controller);
        });

        this.app.listen(config.port, () => {
            console.log(`App is listening on port ${config.port}...`);
        })
    }

    private getExpressCallback(method: HttpMethod): Function {
        const callbackKey = method.toLowerCase() ?? '';

        if (!Reflect.has(this.app, callbackKey)) {
            throw new Error('Given function doesn\'t exist on express applicaiton object!');
        }

        const callback = Reflect.get(this.app, method.toLowerCase()) as Function;
        return callback.bind(this.app);
    }

    private async handleRequest(route: Route, req: ExpressRequest, res: ExpressResponse) {
        const controller = this.controllers.get(route.controller.name);

        if (!controller) {
            // TODO: warn about not found controller
            return;
        }

        try {
            await controller.call(route.action, req, res);
        } catch (err) {
            new ErrorHandler().handle(err as Error, res);
        }
    }

    public static get(): App {
        if (!App.instance) {
            App.instance = new App();
        }

        return App.instance;
    }
}