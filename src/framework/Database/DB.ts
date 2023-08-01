import mysql, {Pool, PoolConnection} from 'mysql2';
import config from '../../config';

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

    private connect(): Promise<PoolConnection> {
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

    private disconnect(connection: PoolConnection) {
        this.pool.releaseConnection(connection);
    }

    /**
     * Initialize singleton instance of database.
     */    
    public static init() {
        if (!DB.instance) {
            DB.instance = new DB();
        }
    }

    public static close(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!DB.instance.pool) return resolve();

            DB.instance.pool.end(err => {
                if (err) {
                    reject(err);
                }

                resolve();
            })
        })
    }

    /**
     * Execute SQL query with given optional values replacing ? in sql query.
     * 
     * @param sql SQL query to execute
     * @param values optional values replacing ? in sql query
     * @returns promised result
     */
    public static async execute(sql: string, values?: Database.Parameter[]): Promise<Database.Result> {
        const connection: PoolConnection = await DB.instance.connect();
        
        return new Promise((resolve, reject) => {
            connection.execute(sql, values, (err, result: Database.Result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }

                DB.instance.disconnect(connection);
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

                DB.instance.disconnect(connection);
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

                DB.instance.disconnect(connection);
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

                DB.instance.disconnect(connection);
            });
        });
    }
}