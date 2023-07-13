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

    constructor() {
        super();
    }
}