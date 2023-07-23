import DB, { RowData } from "../database/DB";
import Model, { useField } from "./Model"

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

    public static async findByLogin(login: string): Promise<User | null> {
        const result = await DB.execute(`
            SELECT * FROM users
            WHERE login = ?
            LIMIT 1
        `, [login]) as RowData[];

        if (result.length === 0) {
            return null;
        }

        return this.instantiate(result[0]) as User;
    }
}