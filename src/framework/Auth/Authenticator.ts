import {Request as ExpressRequest} from 'express';
import Guard from "./Interfaces/Guard";
import SessionGuard from './SessionGuard';
import User from './User';

export default class Authentificator {
    private guard?: Guard;

    constructor(request: ExpressRequest) {
        if (request.session) {
            this.guard = new SessionGuard(request.session);
        }
    }

    async isAuthenticated(): Promise<boolean> {
        if (!this.guard) {
            throw new Error('Missing authenticator guard!');
        }

        return await this.guard.check();
    }

    async getUser(): Promise<User|null> {
        if (!this.guard) {
            throw new Error('Missing authenticator guard!');
        }

        return this.guard.getUser();
    }

    async login(credentials: Auth.Credentials): Promise<boolean> {
        if (!this.guard) {
            throw new Error('Missing authenticator guard!');
        }

        return this.guard.validate(credentials);
    }

    async logout(): Promise<void> {
        if (!this.guard) {
            throw new Error('Missing authenticator guard!');
        }

        await this.guard.forgetUser();
    }
}