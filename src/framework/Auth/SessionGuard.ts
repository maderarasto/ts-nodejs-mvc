import crypto from 'crypto';

import Guard from "./Interfaces/Guard";
import User from "./User";

export default class SessionGuard implements Guard {
    private _user?: User;

    constructor(private session: Auth.Session) {
    }

    async check(): Promise<boolean> {
        if (this.session.userId) {
            this._user = await User.find(this.session.userId) as User;
        }

        return !!this._user;
    }

    async getUser(): Promise<User|null> {
        if (this._user) {
            return this._user;
        }

        if (this.session.userId) {
            this._user = await User.find(this.session.userId) as User;
        }

        return this._user ?? null;
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
        this.session.userId = user.id;

        return true;
    }

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

    private comparePassword(password: string): boolean {
        return this._user?.password === crypto.createHash('md5').update(password).digest('hex') ?? false;
    }

}