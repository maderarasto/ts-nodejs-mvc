import DB, { RawData } from "../database/DB";
import crypto from 'crypto';

export type AttributeValue = boolean | number | string;
export type ModelAttributes = {
    [key: string]: AttributeValue
}

type ModelProperties = Object & {
    [key: string]: string[]
};

export default class Model extends Object {
    protected static readonly PRIMARY_KEY = 'id';

    protected static tableName: string = '';
    protected static fillable: string[] = [];
    protected static hidden: string[] = [];

    protected attributes: ModelAttributes = {};

    public id?: number;

    constructor() {
        super();
        
        Object.defineProperty(this, 'id', {
            get: function () {
                return this.attributes['id'];
            },
            set: function (value: number) {
                this.attributes['id'] = value;
            }
        })
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

    public getClassName() {
        return Object.getPrototypeOf(this).constructor.name;
    }

    private getFillableFields(): string[] {
        return Object.getPrototypeOf(this).constructor.fillable;
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
                model.setAttribute(key, data[key]);
            }
        });

        return model;
    }

    protected static property(hashable: boolean=false) {
        return function (_: any, {kind, name, addInitializer}: ClassFieldDecoratorContext) {
            if (kind !== 'field') return;
    
            addInitializer(function () {
                Object.defineProperty(this, name, {
                    get: function () {
                        return this.attributes[name];
                    },
                    set: function (value: AttributeValue) {
                        if (!value) return value;

                        if (hashable) {
                            value = crypto.createHash('md5').update(value as string).digest('hex');
                        }

                        this.attributes[name] = value;
                    }
                })
            });
        }
    }
}