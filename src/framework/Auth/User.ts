import DB from "../Database/DB";
import Model from "../Database/Model"
import { Field } from "../Database/Decorators/Field";

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

    @Field()
    public first_name?: string;

    @Field()
    public last_name?: string;

    @Field()
    public login?: string;

    @Field('hashable')
    public password?: string;

    @Field()
    public email?: string;

    @Field()
    public phone?: string;

    constructor() {
        super();
    }

    /**
     * Find user by unique login.
     * 
     * @param login login
     * @returns promised user or null.
     */
    public static async findByLogin(login: string): Promise<User | null> {
        const result = await DB.execute(`
            SELECT * FROM users
            WHERE login = ?
            LIMIT 1
        `, [login]) as Database.RowData[];

        if (result.length === 0) {
            return null;
        }

        return this.instantiate(result[0]) as User;
    }
}