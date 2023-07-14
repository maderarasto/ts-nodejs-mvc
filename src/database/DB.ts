import mysql, {Pool, Connection} from 'mysql2';
import config from '../config';

/**
 * Credentials required to connect to database.
 */
export type DatabaseCredentials = {
    host: string
    user: string
    password: string
    database: string
}

/**
 * Raw data with properties based on record in DB table.
 */
export type RowData = mysql.RowDataPacket;
export type ResultSetHeader = mysql.ResultSetHeader;
export type DbResult = (
    mysql.RowDataPacket[] |
    mysql.RowDataPacket[][] |
    mysql.ResultSetHeader |
    mysql.ResultSetHeader[]
)

type DatabaseParameter = (string | number | boolean | null);

/**
 * Provides functionality for executing SQL queries and using DB transactions.
 */
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

    /**
     * Initialize singleton instance of database.
     */    
    public static init() {
        if (!DB.instance) {
            DB.instance = new DB();
        }
    }

    /**
     * Execute SQL query with given optional values replacing ? in sql query.
     * 
     * @param sql SQL query to execute
     * @param values optional values replacing ? in sql query
     * @returns promised result
     */
    public static async execute(sql: string, values?: DatabaseParameter[]): Promise<DbResult> {
        const connection: Connection = await DB.instance.connect();
        
        return new Promise((resolve, reject) => {
            connection.execute(sql, values, (err, result: DbResult) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        })
    }

    /**
     * Begin DB transaction that can be commited or rollbacked.
     * 
     * @returns promise of resolving or rejecting operation.
     */
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

    /**
     * Commit changes in DB since last DB transaction.
     * @returns promise of resolving or rejecting operation.
     */
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

    /**
     * Rollback changes in DB since last DB transaction that were not commited.
     * @returns 
     */
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