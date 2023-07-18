import dotenv from 'dotenv';
import { DatabaseCredentials } from "./database/DB";
import { ControllerClass, Route } from './controllers/Controller';
import IndexController from './controllers/IndexController';
import { getenv } from './utils';
import moment from 'moment';

dotenv.config();

type AppConfig = {
    name: string,
    port: number,
    
    database: {
        credentials: DatabaseCredentials
    },

    session: {
        secret: string,
        lifetime: number,
    },

    controllers: ControllerClass[],
    routes: Route[],
    middlewares: [],
};

const config: AppConfig = {
    name: getenv('APP_NAME'),
    port: parseInt(getenv('APP_PORT', '3000')),

    database: {
        credentials: {
            host: getenv('DB_HOST'),
            user: getenv('DB_USER'),
            password: getenv('DB_PASS'),
            database: getenv('DB_NAME')
        }
    },

    session: {
        secret: getenv('SESSION_SECRET'),
        lifetime: parseInt(getenv('SESSION_LIFETIME', '120')),
        
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