import dotenv from 'dotenv';
import { DatabaseCredentials } from "./database/DB";
import { ControllerClass, Route } from './controllers/Controller';
import IndexController from './controllers/IndexController';
import { getenv } from './utils';

dotenv.config();

type AppConfig = {
    name: string,
    port: number,
    
    database: {
        credentials: DatabaseCredentials
    },

    controllers: ControllerClass[],
    routes: Route[],
    middlewares: [],
};

const config: AppConfig = {
    name: getenv('APP_NAME'),
    port: parseInt(getenv('APP_PORT')),

    database: {
        credentials: {
            host: getenv('DB_HOST'),
            user: getenv('DB_USER'),
            password: getenv('DB_PASS'),
            database: getenv('DB_NAME')
        }
    },

    controllers: [
        IndexController
    ],

    routes: [
        { path: '/', method: 'GET', controller: IndexController, action: 'index' }
    ],

    middlewares: []
}

export default config;