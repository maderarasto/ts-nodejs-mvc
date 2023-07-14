import express from 'express';

import DB from './database/DB';
import config from './config';
import Controller from './controllers/Controller';

const app = express();

const httpMethodBindings = {
    GET: app.get,
    POST: app.post,
    PUT: app.put,
    PATCH: app.patch,
    DELETE: app.delete
};

app.use(express.json());
app.listen(config.port, async () => {
    console.log(`App is listening on port ${config.port}...`);
    
    // Initialize database
    DB.init();

    // Initialize controllers
    config.controllers.forEach(controllerCls => {
        new controllerCls();

        // Process controller

        // Bind routes to controller
        const controllerRoutes = config.routes.filter(
            ({controller}) => controller === controllerCls
        );
        
        controllerRoutes.forEach(route => {
            if (!(httpMethodBindings as Object).hasOwnProperty(route.method)) {
                return;
            }
        })
    })
});    