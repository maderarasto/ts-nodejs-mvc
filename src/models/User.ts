import Model, { AttributeValue, ModelAttributes } from "./Model"

export default class User extends Model {
    
    protected static fillable: string[] = [
        'first_name',
        'last_name',
        'login',
        'password',
        'email',
        'phone'
    ];

    @Model.property()
    public first_name?: string;

    @Model.property()
    public last_name?: string;

    @Model.property()
    public login?: string;

    @Model.property()
    public password?: string;
}