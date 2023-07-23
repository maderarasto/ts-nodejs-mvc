import express from 'express';
import { Liquid } from 'liquidjs';
import session, { Store } from 'express-session';
import moment from 'moment';
import fs from 'fs';
import path from 'path';

import DB from './database/DB';
import config from './config';
import { ErrorHandler, getenv } from './utils';
import { existsSync } from 'fs';

const app = express();
const engine = new Liquid();

declare module 'express-session' {
    interface SessionData {
        userId?: number
    }
}

const MySQLStore = require('express-mysql-session')(session);
const FileStore = require('session-file-store')(session);

let sessionStore: Store;

if (config.session.driver === 'database') {
    sessionStore = new MySQLStore({
        host: config.database.credentials.host,
        user: config.database.credentials.user,
        pass: config.database.credentials.password,
        database: config.database.credentials.database,
        expiration: moment.duration(config.session.lifetime, 'minutes').asMilliseconds(),
    });
} else {
    sessionStore = new FileStore({
        path: config.session.files,
        //ttl: moment.duration(config.session.lifetime, 'minutes').asSeconds()
        ttl: 60,
        reapInterval: moment.duration(15, 'minutes').asSeconds()
    });
}

const httpCallbacks = {
    GET: app.get.bind(app),
    POST: app.post.bind(app),
    PUT: app.put.bind(app),
    PATCH: app.patch.bind(app),
    DELETE: app.delete.bind(app)
};

app.engine('liquid', engine.express());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'liquid');

// Set up sessions
app.use(session({
    store: sessionStore,
    secret: config.session.secret,
    saveUninitialized: true,
    resave: false
}));

app.listen(config.port, async () => {
    console.log(`App is listening on port ${config.port}...`);
    
    // Initialize database
    DB.init();

    if (!fs.existsSync(path.join(__dirname, 'storage/sessions'))) {
        fs.mkdirSync(path.join(__dirname, 'storage/sessions'));
    }
    
    // Initialize controllers
    config.controllers.forEach(controllerCls => {
        const controller = new controllerCls();

        // Process controller

        // Bind routes to controller
        const controllerRoutes = config.routes.filter(
            ({controller}) => controller === controllerCls
        );
        
        controllerRoutes.forEach(route => {
            if (!httpCallbacks.hasOwnProperty(route.method)) {
                return;
            }

            httpCallbacks[route.method](route.path, async (req, res) => {
                //res.setHeader('Content-Type', 'application/json');

                try {
                    await controller.call(route.action, req, res);
                } catch (err) {
                    new ErrorHandler().handle(err as Error, res);
                }
            });
        });
    });
});    