import Model, { ModelAttributes } from "./Model"

interface UserPros {
    first_name?: string;
}

export default class User extends Model implements UserPros {

    @Model.propertyOf('User')
    first_name?: string | undefined;

    protected static fillable = [
        'first_name',
        'last_name',
        'login',
        'password',
        'email',
        'phone'
    ];

    constructor(data: ModelAttributes) {
        super(data);
        console.log(this.attributes);
        
    }
}