import DB, { RawData } from "../database/DB";
import DbEntity from "../database/DbEntity";
import User from "./User";

export type ModelAttributes = {
    [key: string]: boolean | number | string
}

export default class Model extends DbEntity {
    protected static fillable: string[] = [];
    protected static hidden: string[] = [];

    protected attributes: ModelAttributes = {};

    @DbEntity.column
    public id?: number;

    constructor(data: ModelAttributes = {}) {
        super();        
    }

    public static async find(id: number): Promise<Model | null> {
        // if (this.name === Model.name) {
        //     throw new Error('A base model class cannot be querable!');
        // }

        const result = await DB.execute(`
            SELECT * FROM ${Model.tableName}
            WHERE id = ?
            LIMIT 1
        `, [id]) as RawData[];

        const found = result[0] ?? null;
        if (!found) {
            return null;
        }
        
        return Model.instantiate(found);
    }

    protected static instantiate(data: RawData): Model {
        const model: Object & Model = new this();

        Object.keys(data).forEach((key: string) => {
            if (model.hasOwnProperty(key)) {
                const propertyDesc = Object.getOwnPropertyDescriptor(model, key);

                if (propertyDesc && propertyDesc.set) {
                    propertyDesc.set.call(model, data[key]);
                }
            }
        });

        return model;
    }
}