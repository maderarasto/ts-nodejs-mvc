import crypto from 'crypto';

import Guard from "./Interfaces/Guard";
import User from "./User";

/**
 * Represents autentication guard that uses sessions.
 */
export default class SessionGuard implements Guard {
    private _user?: User;

    constructor(private session: Auth.Session) {
    }

    /**
     * Check if user was authenticated for current session.
     * @returns promise of check result.
     */
    async check(): Promise<boolean> {
        if (this.session.userId) {
            this._user = await User.find(this.session.userId) as User;
        }

        return !!this._user;
    }

    /**
     * Get an authenticated user through session.
     * @returns promise of authenticated user.
     */
    async getUser(): Promise<User|null> {
        if (this._user) {
            return this._user;
        }

        if (this.session.userId) {
            this._user = await User.find(this.session.userId) as User;
        }

        return this._user ?? null;
    }

    /**
     * Validate user credentials. If they are valid then it sets authenticated user.
     * 
     * @param credentials credentials of user.
     * @returns promise of validation result.
     */
    async validate(credentials: Auth.Credentials): Promise<boolean> {
        const user = await User.findByLogin(credentials.login);

        if (!user) {
            return false;
        }

        if (this.comparePassword(credentials.password)) {
            return false;
        }

        // Store auth data after successful validation
        this.session.userId = user.id;

        return true;
    }

    /**
     * Forget authenticated user and destroying session.
     * @returns 
     */
    async forgetUser(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.session.destroy(err => {
                if (err) {
                    reject(err);
                    return;
                }

                this._user = undefined;
            })
        })    
    }

    /**
     * Compare hash value of given password with password of current user.
     * @param password password
     * @returns result of comparing.
     */
    private comparePassword(password: string): boolean {
        return this._user?.password === crypto.createHash('md5').update(password).digest('hex') ?? false;
    }

}