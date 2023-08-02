import session, { Store } from 'express-session';
import moment from 'moment';

import Application from '../../Core/Application';
import Provider from "../../Core/Interfaces/Provider";

const FileStore = require('session-file-store')(session);
const MySQLStore = require('express-mysql-session')(session);

export default class SessionStoreProvider implements Provider<Auth.Session.Driver, Store> {
    private storeFactory: Map<Auth.Session.Driver, Store>;

    constructor(app: Application) {
        this.storeFactory = new Map([
            [
                'file', new FileStore({
                    path: app.config.session.files,
                    ttl: moment.duration(app.config.session.lifetime, 'minutes').asSeconds(),
                    reapInterval: moment.duration(15, 'minutes').asSeconds()
                })
            ],
            [
                'database', new MySQLStore({
                    host: app.config.database.credentials.host,
                    user: app.config.database.credentials.user,
                    pass: app.config.database.credentials.password,
                    database: app.config.database.credentials.database,
                    expiration: moment.duration(
                        app.config.session.lifetime, 'minutes'
                    ).asMilliseconds(),
                })
            ]
        ]);
    }

    get(key: Auth.Session.Driver): Store {
        if (!this.storeFactory.has(key)) {
            throw new Error(`Session store with driver '${key}' not found !`);
        }

        return this.storeFactory.get(key) as Store;
    }

    all(): Map<Auth.Session.Driver, Store> {
        const stores: Map<Auth.Session.Driver, Store> = new Map();

        this.storeFactory.forEach((storeFactory, sessionDriver) => {
            stores.set(sessionDriver, storeFactory);
        })

        return stores;
    }

}