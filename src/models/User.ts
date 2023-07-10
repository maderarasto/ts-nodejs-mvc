import DbEntity from "../database/DbEntity";
import Model, { ModelAttributes } from "./Model"

@DbEntity.useTable('users')
export default class User extends Model {

    constructor(data: ModelAttributes) {
        super(data);

        this.attributes.id = 3;
    }
}