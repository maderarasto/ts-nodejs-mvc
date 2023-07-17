import DB, { RowData } from "../database/DB";
import Model, { useField } from "./Model"
import crypto from 'crypto';

type UserCredentials = {
    login: string,
    password: string,
}

/**
 * Represents a user in system.
 */
export default class User extends Model {
    
    protected static fillable: string[] = [
        'first_name',
        'last_name',
        'login',
        'password',
        'email',
        'phone'
    ];

    @useField()
    public first_name?: string;

    @useField()
    public last_name?: string;

    @useField()
    public login?: string;

    @useField('hashable')
    public password?: string;

    @useField()
    public email?: string;

    @useField()
    public phone?: string;

    constructor() {
        super();
    }

    public static async auth(credentials: UserCredentials, rememberMe?: string): Promise<boolean> {
        const {login, password} = credentials;
        
        const result = await DB.execute(`
            SELECT * FROM users
            WHERE login = ?
            LIMIT 1
        `, [login]) as RowData[];

        if (result.length === 0) {
            return false;
        }

        const user = this.instantiate(result[0]) as User;
        const passwordHashed = crypto.createHash('md5').update(password).digest('hex');

        return user.password === passwordHashed;
    }
}