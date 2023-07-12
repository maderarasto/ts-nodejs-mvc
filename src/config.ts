import dotenv from 'dotenv';
import { DatabaseCredentials } from "./database/DB";

dotenv.config();

export function getenv(key: string, defaultValue?: string): string {
    if (!(key in process.env)) {
        return defaultValue as string;
    }

    return process.env[key] as string;
}

type AppConfig = {
    name: string,
    port: number,
    database: {
        credentials: DatabaseCredentials
    }
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
    }
}

export default config;