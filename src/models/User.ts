import { log } from "console";
import DbEntity from "../database/DbEntity";
import Model, { ModelAttributes } from "./Model"

@DbEntity.useTable('users')
export default class User extends Model {

    // @DbEntity.column
    // public firstName: string;

    // @DbEntity.column
    // public lastName: string;

    // @DbEntity.column
    // public login: string;

    // @DbEntity.column
    // public password: string;

    @DbEntity.column
    public email?: string;

    @DbEntity.column
    public phone?: string;

    constructor(data: ModelAttributes) {
        super(data);
    }
}