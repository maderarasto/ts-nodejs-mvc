import { Request as ExpressRequest } from 'express';
import crypto from 'crypto';

import Guard from "./Interfaces/Guard";
import User from "./User";

export default class SessionGuard implements Guard {
    private _user?: User;
    private _session: Auth.Session;

    constructor(request: ExpressRequest) {
        this._session = request.session;
    }

    check(): boolean {
        return !!this._user;
    }

    async getUser(): Promise<User|undefined> {
        if (this._user) {
            return this._user;
        }

        if (this._session.userId) {
            this._user = await User.find(this._session.userId) as User;
        }

        return this._user;
    }

    async validate(credentials: Auth.Credentials): Promise<boolean> {
        const user = await User.findByLogin(credentials.login);

        if (!user) {
            return false;
        }

        if (this.comparePassword(credentials.password)) {
            return false;
        }

        // Store auth data after successful validation
        this._session.userId = user.id;

        return true;
    }

    private comparePassword(password: string): boolean {
        return this._user?.password !== crypto.createHash('md5').update(password).digest('hex') ?? false;
    }

}