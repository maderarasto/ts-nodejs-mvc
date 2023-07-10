import DB, { RawData } from "../database/DB";
import DbEntity from "../database/DbEntity";

export type ModelAttributes = {
    [key: string]: boolean | number | string
}

export default class Model extends DbEntity {
    protected attributes: ModelAttributes = {};

    @DbEntity.useColumn('id')
    public id?: number;

    constructor(data: ModelAttributes) {
        super();
    }

    public static async find(id: number): Promise<Model | null> {
        if (this.name === Model.name) {
            throw new Error('A base model class cannot be querable!');
        }

        const result = await DB.execute(`
            SELECT * FROM ${Model.tableName}
            WHERE id = ?
        `, [id]) as RawData[];

        const found = result[0] ?? null;
        if (!found) {
            return null;
        }
        
        return new this({});
    }
}