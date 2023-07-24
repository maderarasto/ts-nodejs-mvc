import { Session as ExpressSession, SessionData } from "express-session";

import User from "../models/User";
import crypto from 'crypto';

type Session = ExpressSession & Partial<SessionData>

export type UserCredentials = {
    login: string,
    password: string
};

export default class AuthService {
    private constructor() {

    }
    
    static isAuthenticated(session: Session): boolean {
        return session.userId !== undefined;
    }

    static async getUser(session: Session): Promise<User|null> {
        if (!session.userId) {
            return null;
        }

        return await User.find(session.userId) as User;
    }

    static async authenticate(credentials: UserCredentials, session: Session): Promise<boolean> {
        const user = await User.findByLogin(credentials.login);
        
        if (!user) {
            return false;
        }

        const passwordHashed = crypto.createHash('md5').update(credentials.password).digest('hex');
        const authenticated = passwordHashed === user.password;

        if (authenticated) {
            session.userId = user.id;
        }

        return authenticated;
    }

    static async logout(session: Session): Promise<void> {
        return new Promise((resolve, reject) => {
            session.destroy(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}