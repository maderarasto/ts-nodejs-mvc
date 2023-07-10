import { DatabaseCredentials } from "./database/DB";

type AppConfig = {
    port: number,
    database: {
        credentials: DatabaseCredentials
    }
};

const config: AppConfig = {
    port: 3000,

    database: {
        credentials: {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'recruitapp'
        }
    }
}

export default config;