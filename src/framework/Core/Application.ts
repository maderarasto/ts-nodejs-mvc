import session, { Store } from 'express-session';
import { Liquid } from 'liquidjs';
import path from 'path';

import express, { 
    Request as ExpressRequest, 
    Response as ExpressResponse 
} from 'express';

import SessionStoreProvider from '../Auth/Providers/SessionStoreProvider';
import ServiceProvider from '../Providers/ServiceProvider';
import ControllerDispatcher from '../Routing/ControllerDispatcher';
import FileSystem from './FileSystem';
import { ErrorHandler } from './ErrorHandler';
import Defines from '../defines';
import DB from '../Database/DB';

export default class Application {
    /**
     * Express application that handle incoming connections
     */
    private app: express.Express;
    
    private _config: Application.Config;
    private _sessionStoreProvider: SessionStoreProvider;
    private _serviceProvider: ServiceProvider;
    private _controllerDispatcher: ControllerDispatcher;

    constructor(config: Application.Config) {
        this.app = express();
        this._config = config;
        this._sessionStoreProvider = new SessionStoreProvider(this);
        this._serviceProvider = new ServiceProvider(this);
        this._controllerDispatcher = new ControllerDispatcher(this);

        this.app.engine('liquid', new Liquid().express());
        this.app.set('view engine', 'liquid');
        this.app.set('views', [
            config.views.dir,
            path.join(Defines.SRC_DIR, 'framework/View'),
            path.join(Defines.SRC_DIR, 'framework/View/Errors')
        ]);
        
        this.app.use(
            session({
                store: this._sessionStoreProvider.get(config.session.driver),
                secret: config.session.secret,
                saveUninitialized: true,
                resave: false
            })
        );

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