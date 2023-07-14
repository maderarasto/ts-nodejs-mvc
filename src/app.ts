import express, { IRouterMatcher, Express, Request, Response } from 'express';

import DB from './database/DB';
import config from './config';
import Controller, { Route } from './controllers/Controller';

const app = express();
const httpCallbacks = {
    GET: app.get.bind(app),
    POST: app.post.bind(app),
    PUT: app.put.bind(app),
    PATCH: app.patch.bind(app),
    DELETE: app.delete.bind(app)
};

app.use(express.json());
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

            httpCallbacks[route.method](route.path, (req, res) => {
                res.setHeader('Content-Type', 'application/json');

                try {
                    if (!Reflect.has(controller, route.action)) {
                        throw new Error(`Action ${route.action} doesn't exists on controller ${controllerCls.name}!`);
                    }
    
                    // run action
                    Reflect.get(controller, route.action).call(controller, req, res);
                } catch (err) {
                    if (err instanceof Error) {
                        res.status(400).end(err.stack);
                    }
                }
            });
        });
    });
});    