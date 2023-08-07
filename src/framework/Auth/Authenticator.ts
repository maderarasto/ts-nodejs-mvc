import {Request as ExpressRequest} from 'express';
import Guard from "./Interfaces/Guard";
import SessionGuard from './SessionGuard';
import User from './User';

/**
 * Represents interface for authenticating user based on resolver authentication guard.
 */
export default class Authentificator {
    private guard?: Guard;

    constructor(request: ExpressRequest) {
        if (request.session) {
            this.guard = new SessionGuard(request.session);
        }
    }

    /**
     * Check if user is authenticated.
     * @returns promise of authenticated result.
     */
    async isAuthenticated(): Promise<boolean> {
        if (!this.guard) {
            throw new Error('Missing authenticator guard!');
        }

        return await this.guard.check();
    }

    /**
     * Get currently authenticated user.
     * @returns promise of authenticated user or null.
     */
    async getUser(): Promise<User|null> {
        if (!this.guard) {
            throw new Error('Missing authenticator guard!');
        }

        return this.guard.getUser();
    }

    /**
     * Login user using credentials.
     * 
     * @param credentials user credentials.
     * @returns promise of login result.
     */
    async login(credentials: Auth.Credentials): Promise<boolean> {
        if (!this.guard) {
            throw new Error('Missing authenticator guard!');
        }

        return this.guard.validate(credentials);
    }

    /**
     * Log out user.
     */
    async logout(): Promise<void> {
        if (!this.guard) {
            throw new Error('Missing authenticator guard!');
        }

        await this.guard.forgetUser();
    }
}