import DB, { RawData } from "../database/DB";

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
    
    private static propertiesPerModel: ModelProperties = {
        model: [ Model.PRIMARY_KEY ],
        installation: [ 'name' ]
    };

    protected attributes: ModelAttributes = {};

    public id?: number;

    constructor(data: ModelAttributes = {}) {
        super();    
        
        this.initializeProperties();
        this.fill(data);
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

    private getClassName() {
        return Object.getPrototypeOf(this).constructor.name;
    }

    private initializeProperties() {
        const validModels = [ 
            Model.name.toLowerCase(), 
            this.getClassName().toLowerCase()
        ];
        
        let propertyKeys: string[] = [];    
        for (let [modelName, modelPropKeys] of Object.entries(Model.propertiesPerModel)) {
            if (validModels.includes(modelName)) {
                propertyKeys.push(...modelPropKeys);
            }
        }            
        
        propertyKeys.forEach(propertyKey => {
            Object.defineProperty(this, propertyKey, {
                get: function () {
                    this.attributes[propertyKey]
                },
                set: function (value) {
                    this.attributes[propertyKey] = value;
                }
            });
        });
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

    public static propertyOf(clsName: string) {
        return function (_: any, {kind, name}: ClassFieldDecoratorContext) {
            if (kind !== 'field') return;

            const clsNameKey = clsName.toLowerCase();
            const fieldName = name as string;

            if (!Model.propertiesPerModel.hasOwnProperty(clsNameKey)) {
                Model.propertiesPerModel[clsNameKey] = [];
            }
            
            Model.propertiesPerModel[clsNameKey].push(fieldName);
        }
    }
}