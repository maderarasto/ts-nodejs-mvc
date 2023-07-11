"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const config_1 = __importDefault(require("../config"));
class DB {
    constructor() {
        this.pool = mysql2_1.default.createPool({
            connectionLimit: 10,
            host: config_1.default.database.credentials.host,
            user: config_1.default.database.credentials.user,
            password: config_1.default.database.credentials.password,
            database: config_1.default.database.credentials.database
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(connection);
                }
            });
        });
    }
    static init() {
        if (!DB.instance) {
            DB.instance = new DB();
        }
    }
    static async execute(sql, values) {
        const connection = await DB.instance.connect();
        return new Promise((resolve, reject) => {
            connection.execute(sql, values, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    static async beginTransaction() {
        const connection = await DB.instance.connect();
        return new Promise((resolve, reject) => {
            connection.beginTransaction(err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    static async commit() {
        const connection = await DB.instance.connect();
        return new Promise((resolve, reject) => {
            connection.commit(err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    static async rollback() {
        const connection = await DB.instance.connect();
        return new Promise((resolve, reject) => {
            connection.rollback(err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
}
exports.default = DB;
