import express from 'express';
import { Liquid } from 'liquidjs';
import session from 'express-session';
import path from 'path';

import DB from './database/DB';
import config from './config';
import Controller, { ErrorResponse, Route } from './controllers/Controller';
import { ErrorHandler } from './utils';
import User from './models/User';

const app = express();
const engine = new Liquid();

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
    secret: config.session.secret,
    saveUninitialized: true,
    resave: false
}));

app.listen(config.port, async () => {
    console.log(`App is listening on port ${config.port}...`);
    
    // Initialize database
    DB.init();
    
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