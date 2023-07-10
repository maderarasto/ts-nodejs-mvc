import mysql, {Pool, Connection} from 'mysql2';
import config from '../config';

export type DatabaseCredentials = {
    host: string
    user: string
    password: string
    database: string
}

export type RawData = mysql.RowDataPacket;

type DatabaseParameter = (string | number | boolean);

export default class DB {
    private static instance: DB;
    private pool: Pool;

    private constructor() {
        this.pool = mysql.createPool({
            connectionLimit: 10,
            host: config.database.credentials.host,
            user: config.database.credentials.user,
            password: config.database.credentials.password,
            database: config.database.credentials.database
        });
    }

    private connect(): Promise<Connection> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(connection);
                }
            });
        })
    }

    public static init() {
        if (!DB.instance) {
            DB.instance = new DB();
        }
    }

    public static async execute(sql: string, values?: DatabaseParameter[]) {
        const connection: Connection = await DB.instance.connect();
        
        return new Promise((resolve, reject) => {
            connection.execute(sql, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        })
    }

    public static async beginTransaction(): Promise<void> {
        const connection = await DB.instance.connect();

        return new Promise((resolve, reject) => {
            connection.beginTransaction(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public static async commit(): Promise<void> {
        const connection = await DB.instance.connect();

        return new Promise((resolve, reject) => {
            connection.commit(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public static async rollback(): Promise<void> {
        const connection = await DB.instance.connect();

        return new Promise((resolve, reject) => {
            connection.rollback(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}