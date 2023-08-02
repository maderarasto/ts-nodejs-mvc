import crypto from 'crypto';
import User from './User';

export default class Auth {
    isAuthenticated(session: Auth.Session): boolean {
        return session.userId !== undefined;
    }

    async getUser(session: Auth.Session): Promise<User|null> {
        if (!session.userId) {
            return null;
        }

        return await User.find(session.userId) as User;
    }

    async authenticate(credentials: Auth.Credentials, session: Auth.Session): Promise<boolean> {
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

    async logout(session: Auth.Session): Promise<void> {
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