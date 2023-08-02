import session, { Store } from 'express-session';
import { Liquid } from 'liquidjs';
import path from 'path';

import express, { 
    Request as ExpressRequest, 
    Response as ExpressResponse 
} from 'express';

import FileSystem from './FileSystem';

const FileStore = require('session-file-store')(session);
const MySQLStore = require('express-mysql-session')(session);

import ServiceManager from '../Routing/ServiceManager';
import ControllerDispatcher from '../Routing/ControllerDispatcher';
import { ErrorHandler } from './ErrorHandler';
import DB from '../Database/DB';
import Defines from '../defines';
import ServiceProvider from '../Providers/ServiceProvider';

export default class Application {
    /**
     * Express application that handle incoming connections
     */
    private app: express.Express;
    
    private _config: Application.Config;
    private _serviceProvider: ServiceProvider;
    private _controllerDispatcher: ControllerDispatcher;

    constructor(config: Application.Config) {
        this.app = express();
        this._config = config;
        this._serviceProvider = new ServiceProvider(this);
        this._controllerDispatcher = new ControllerDispatcher(this);

        this.app.engine('liquid', new Liquid().express());
        this.app.set('views', [
            config.views.dir,
            path.join(Defines.SRC_DIR, 'framework/View'),
            path.join(Defines.SRC_DIR, 'framework/View/Errors')
        ]);
        this.app.set('view engine', 'liquid');

        // TODO: initialize session

        console.log(Defines.SRC_DIR);
    }

    get config() {
        return this._config;
    }

    get serviceProvider() {
        return this._serviceProvider;
    }

    /**
     * Initialize components of application and start listening for incoming connections.
     */
    start() {
        DB.init();
        
        if (this.config.session.driver === 'file') {
            if (!FileSystem.exists(path.join(Defines.SRC_DIR, 'storage/sessions'))) {
                FileSystem.makeDirectory(path.join(Defines.SRC_DIR, 'storage/sessions'), { 
                    recursive: true 
                });
            }
        }

        this.config.routes?.forEach(route => {
            let routePath = route.path;

            if (routePath.charAt(0) !== '/') {
                routePath = '/' + routePath;
            }

            const expressCallback = this.resolveExpressCallback(route.method);
            expressCallback(routePath, this.handleRequest.bind(this, route));
        });

        this.app.all('*', (req, res) => {
            res.render('error404');
        });

        this.app.listen(this.config.port, () => {
            console.log(`App is listening on port ${this.config.port}...`);
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
            await this._controllerDispatcher.dispatch(route, req, res);
        } catch (err) {
            console.log(err);
            new ErrorHandler().handle(err as Error, res);
        }
    }
}