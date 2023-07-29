import dotenv from 'dotenv';
import { DatabaseCredentials } from "./database/DB";
import { Route } from './controllers/Controller';
import { getenv } from './utils';
import path from 'path';

dotenv.config();

type AppConfig = {
    name: string,
    port: number,
    rootDir: string,
    srcDir: string
    
    database: {
        credentials: DatabaseCredentials
    },

    session: {
        driver: 'file' | 'database',
        files: string,
        secret: string,
        lifetime: number,
    },

    /**
     * List of registered routes that can be trigger using controllers
     */
    routes: Route[],
};

const config: AppConfig = {
    name: getenv('APP_NAME'),
    port: parseInt(getenv('APP_PORT', '3000')),
    rootDir: path.dirname(__dirname),
    srcDir: __dirname,

    database: {
        credentials: {
            host: getenv('DB_HOST'),
            user: getenv('DB_USER'),
            password: getenv('DB_PASS'),
            database: getenv('DB_NAME')
        }
    },

    session: {
        driver: getenv('SESSION_DRIVER', 'file') as 'file' | 'database',
        files: path.join(__dirname, 'storage/sessions'),
        secret: getenv('SESSION_SECRET'),
        lifetime: parseInt(getenv('SESSION_LIFETIME', '120')),
        
    },

    routes: [
        { 
            path: '/', 
            method: 'GET', 
            controller: 'IndexController', 
            action: 'index' 
        },
        { 
            path: 'backoffice/users', 
            method: 'GET', 
            controller: 'Backoffice/UserController', 
            action: 
            'index'
        },
    ],
}

export default config;