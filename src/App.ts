import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import moment from 'moment';
import path from 'path';
import fs from 'fs';

import session, { Store } from 'express-session';
import { Liquid } from 'liquidjs';
import config from './config';

import DB from './framework/Database/DB';
import { ErrorHandler } from './utils';
import ControllerDispatcher from './framework/Core/ControllerDispatcher';
import ServiceManager from './ServiceManager';

/**
 * Represents data that can be stored in session.
 */
// declare module 'express-session' {
//     interface SessionData {
//         userId?: number
//     }
// }

const FileStore = require('session-file-store')(session);
const MySQLStore = require('express-mysql-session')(session);

/**
 * Represents a container fo whole application and also it's entry point of application.
 */
export default class App {
    /**
     * Session store factories based on driver in config.
     */
    private static readonly SESSION_STORES: Record<Auth.Session.Driver, Store> = {
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

    /**
     * Express application that handle incoming connections
     */
    private app: express.Express;

    /**
     * Dispatcher that creates controller based on route and is responsible for calling controller's action.
     */
    private controllerDispatcher: ControllerDispatcher;
    private _serviceManager: ServiceManager;

    constructor() {
        this.app = express();
        this._serviceManager = new ServiceManager();
        this.controllerDispatcher = new ControllerDispatcher(this);

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

    /**
     * Get a manager for accessing loaded services.
     */
    public get serviceManager() {
        return this._serviceManager;
    }

    /**
     * Initialize components of application and start listening for incoming connections.
     */
    public start() {
        DB.init();

        if (config.session.driver === 'file') {
            if (!fs.existsSync(path.join(__dirname, 'storage/sessions'))) {
                fs.mkdirSync(path.join(__dirname, 'storage/sessions'));
            }
        }

        config.routes.forEach(route => {
            let routePath = route.path;

            if (routePath.charAt(0) !== '/') {
                routePath = '/' + routePath;
            }

            const expressCallback = this.resolveExpressCallback(route.method);
            expressCallback(routePath, this.handleRequest.bind(this, route));
        });

        this.app.all('*', (req, res) => {
            res.render('error');
        });

        this.app.listen(config.port, () => {
            console.log(`App is listening on port ${config.port}...`);
        })
    }

    /**
     * Resolves an appropriate callback for handling connection bassed on HTTP method.
     * 
     * @param method type of http method
     * @returns callback for handling HTTP request
     */
    private resolveExpressCallback(method: Routing.Method): Function {
        const callbackKey = method.toLowerCase() ?? '';

        if (!Reflect.has(this.app, callbackKey)) {
            throw new Error('Given function doesn\'t exist on express applicaiton object!');
        }

        const callback = Reflect.get(this.app, method.toLowerCase()) as Function;
        return callback.bind(this.app);
    }

    /**
     * Handle an incoming request and with controller dispatcher triggers appropriate controller action.
     * 
     * @param route route binded to incoming request
     * @param req associated data with request
     * @param res associated data with response
     */
    private async handleRequest(route: Routing.Route, req: ExpressRequest, res: ExpressResponse) {
        try {
            await this.controllerDispatcher.dispatch(route, req, res);
        } catch (err) {
            console.log(err);
            new ErrorHandler().handle(err as Error, res);
        }
    }
}