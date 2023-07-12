import DB, { RawData } from "../database/DB";
import crypto from 'crypto';

export type AttributeValue = boolean | number | string;
export type ModelAttributes = {
    [key: string]: AttributeValue
}

type ModelProperties = Object & {
    [key: string]: string[]
};

type FieldOption = ('hashable');

export function useField(...args: FieldOption[]) {
    return function (_: any, {kind, name, addInitializer}: ClassFieldDecoratorContext) {
        if (kind !== 'field') return;

        addInitializer(function () {
            Object.defineProperty(this, name, {
                get: function () {
                    return this.attributes[name];
                },
                set: function (value: AttributeValue) {
                    if (!value) return value;

                    if (args.includes('hashable')) {
                        value = crypto.createHash('md5').update(value as string).digest('hex');
                    }

                    this.attributes[name] = value;
                }
            })
        });
    }
}

export default class Model extends Object {
    protected static readonly PRIMARY_KEY = 'id';

    protected static tableName: string = '';
    protected static fillable: string[] = [];
    protected static hidden: string[] = [];

    protected attributes: ModelAttributes = {};

    @useField()
    public id?: number;

    constructor() {
        super();
    }

    public setAttribute(key: string, value: AttributeValue) {
        const propertyDesc = Object.getOwnPropertyDescriptor(this, key);

        if (propertyDesc && propertyDesc.set) {
            propertyDesc.set.call(this, value);
        }
    }

    public fill(data: ModelAttributes) {
        const fillableFields = this.getFillableFields();
        
        Object.entries(data).forEach(([key, value]) => {
            if (fillableFields.includes(key)) {
                this.setAttribute(key, value);
            }
        });
    }

    public getClassName(): string {
        return Object.getPrototypeOf(this).constructor.name;
    }

    private getFillableFields(): string[] {
        return Object.getPrototypeOf(this).constructor.fillable;
    }

    public static async find(id: number): Promise<Model | null> {
        // if (this.name === Model.name) {
        //     throw new Error('A base model class cannot be querable!');
        // }

        let found = null;

        try {
            const result = await DB.execute(`
                SELECT * FROM ${this.getTableName()}
                WHERE id = ?
                LIMIT 1
            `, [id]) as RawData[];

            found = result[0] ?? null;
            
        } catch (err) {
            console.log(err);
        }

        if (!found) {
            return null;
        }

        return this.instantiate(found);
    }

    public static async findMany(ids: number[]): Promise<Model[]> {
        // if (this.name === Model.name) {
        //     throw new Error('A base model class cannot be querable!');
        // }

        let result: RawData[] = [];

        try {
            result = await DB.execute(`
                SELECT * FROM ${this.getTableName()}
                WHERE id IN (${ids.join(',')})
            `) as RawData[];
        } catch (err) {
            console.log(err);
        }

        if (!result || result.length === 0) {
            return [];
        }

        const models: Model[] = [];
        result.forEach(rowData => {
            models.push(this.instantiate(rowData));
        });

        return models;
    }

    public static async get(): Promise<Model[]> {
        // if (this.name === Model.name) {
        //     throw new Error('A base model class cannot be querable!');
        // }

        let result: RawData[] = [];

        try {
            result = await DB.execute(`
                SELECT * FROM ${this.getTableName()}
            `) as RawData[];
        } catch (err) {
            console.log(err);
        }

        if (!result || result.length === 0) {
            return [];
        }

        const models: Model[] = [];
        result.forEach(rowData => {
            models.push(this.instantiate(rowData));
        });

        return models;
    }

    protected static getTableName() {
        if (Model.tableName !== '') return Model.tableName;

        let splittedClsName = this.name.split(/(?=[A-Z])/);
        splittedClsName = splittedClsName.map(tokenedName => tokenedName.toLowerCase());

        return splittedClsName.join('_') + 's';
    }

    protected static instantiate(data: RawData): Model {
        const model: Object & Model = new this();
        
        Object.keys(data).forEach((key: string) => {
            if (model.hasOwnProperty(key)) {
                model.setAttribute(key, data[key]);
            }
        });

        return model;
    }
}