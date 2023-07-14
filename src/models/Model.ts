import { table } from "console";
import DB, { ResultSetHeader, RowData } from "../database/DB";
import crypto from 'crypto';

/**
 * Represent possible values for attributes.
 */
export type AttributeValue = boolean | number | string | null;

/**
 * Represents list of attributes of model.
 */
export type ModelAttributes = {
    [key: string]: AttributeValue
}

type ModelProperties = Object & {
    [key: string]: string[]
};

/**
 * Represents possible options for decorating column properties of model.
 */
type FieldOption = ('hashable');

/**
 * Define get and set properties for column field.
 * Field can be MD5 hashable using parameter.
 * 
 * @param args {FieldOption} options for manipulating field
 */
export function useField(...args: FieldOption[]) {
    return function (_: any, {kind, name, addInitializer}: ClassFieldDecoratorContext) {
        if (kind !== 'field') return;

        addInitializer(function () {
            Object.defineProperty(this, name, {
                get: function () {
                    return this.attributes[name];
                },
                set: function (value: AttributeValue) {
                    if (value && args.includes('hashable')) {
                        value = crypto.createHash('md5').update(value as string).digest('hex');
                    }

                    this.attributes[name] = value;
                }
            })
        });
    }
}

/**
 * Represents a DB model that holds table records data.
 * Each model uses as primary key column id and table name is based on class name.
 */
export default class Model extends Object {
    protected static readonly PRIMARY_KEY = 'id';

    /**
     * Custom defined name of table.
     */
    protected static tableName: string = '';

    /**
     * List of fields that can be filled using fill method. 
     */
    protected static fillable: string[] = [];

    /**
     * List of fields that will be hidden in exporting data.
     */
    protected static hidden: string[] = [];

    /**
     * Contains data of record from table
     */
    protected attributes: ModelAttributes = {};

    @useField()
    public id?: number;

    protected constructor() {
        super();
    }

    public getClass() {
        return Object.getPrototypeOf(this).constructor;
    }

    /**
     * Set a new value of model property.
     * 
     * @param key {string} name of property
     * @param value {AttributeValue} value of property
     */
    public setAttribute(key: string, value: AttributeValue) {
        const propertyDesc = Object.getOwnPropertyDescriptor(this, key);

        if (propertyDesc && propertyDesc.set) {
            propertyDesc.set.call(this, value);
        }
    }

    /**
     * Fill model with given data of properties that are fillable.
     * 
     * @param data {ModelAttributes} represents new model parameters.
     */
    public fill(data: ModelAttributes) {
        const fillableFields = this.getFillableFields();
        
        Object.entries(data).forEach(([key, value]) => {
            if (fillableFields.includes(key)) {
                this.setAttribute(key, value);
            }
        });
    }

    /**
     * Save data of current instance to table.
     * If model doesn't have id attribute data will be inserted,
     * otherwise data will be updated of table record with given id.
     * 
     * @returns promised information about saving data.
     */
    public async save(): Promise<boolean> {
        let sql = '';
        let values = Object.values(this.attributes).map(value => value !== undefined ? value : null);

        const tableName = this.getClass().getTableName();       

        if (!this.id) {
            const valueSymbols = values.map(value => '?').join(',');
            const columns = Object.keys(this.attributes).map(key => {
                return '`' + key + '`';
            }).join(',');

            sql += `INSERT INTO \`${tableName}\` (${columns}) VALUES (${valueSymbols})`
        } else {
            values = [this.id];
            const editableFields = Object.entries(this.attributes).filter(([name, _]) => name !== 'id');
            const fields = Object.entries(editableFields).map(([_,[name, value]]) => {
                if (typeof value === 'string') {
                    value = `'${value}'`;
                }

                return '`' + name + '` = ' + value
            }).join(', ');

            sql += `UPDATE \`${tableName}\` SET ${fields} WHERE \`id\` = ?`;
        }
        
        const result = await DB.execute(sql, values) as ResultSetHeader;

        if (result) {
            this.id = result.insertId
        }

        return result ? result.affectedRows > 0 : false;
    }

    /**
     * Delete data of current instance from table.
     * 
     * @returns promised information abou deletion
     */
    public async destroy(): Promise<boolean> {
        const sql = `DELETE FROM ${this.getClass().getTableName()} WHERE i = ?`;
        const result = await DB.execute(sql, [this.id as number]) as ResultSetHeader;

        return result ? result.affectedRows > 0 : false;
    }

    /**
     * Get list of field names that can be filled.
     * 
     * @returns {string[]} list of fillable field names.
     */
    private getFillableFields(): string[] {
        return Object.getPrototypeOf(this).constructor.fillable;
    }

    /**
     * Find a specific record by given id.
     * 
     * @param id {number} record id in table
     * @returns {Promise<Model> | null} promised instance of specific model.
     */
    public static async find(id: number): Promise<Model | null> {
        if (this.name === Model.name) {
            throw new Error('A base model class cannot be querable!');
        }

        const result = await DB.execute(`
            SELECT * FROM ${this.getTableName()}
            WHERE id = ?
            LIMIT 1
        `, [id]) as RowData[];

        if (!result || result.length === 0) {
            return null;
        }

        return this.instantiate(result[0]);
    }

    /**
     * Find records by given ids.
     * 
     * @param ids {number[]} record ids in table
     * @returns {Promise<Model[]>} promised list of specific models.
     */
    public static async findMany(ids: number[]): Promise<Model[]> {
        if (this.name === Model.name) {
            throw new Error('A base model class cannot be querable!');
        }

        const result = await DB.execute(`
            SELECT * FROM ${this.getTableName()}
            WHERE id IN (${ids.join(',')})
        `) as RowData[];

        if (!result || result.length === 0) {
            return [];
        }

        const models: Model[] = [];
        result.forEach(rowData => {
            models.push(this.instantiate(rowData));
        });

        return models;
    }

    /**
     * Get all records in the table.
     * 
     * @returns {Promise<Model[]>} promised list of specific models.
     */
    public static async get(): Promise<Model[]> {
        if (this.name === Model.name) {
            throw new Error('A base model class cannot be querable!');
        }

        const result = await DB.execute(`
            SELECT * FROM ${this.getTableName()}
        `) as RowData[];
        
        if (!result || result.length === 0) {
            return [];
        }

        const models: Model[] = [];
        result.forEach(rowData => {
            models.push(this.instantiate(rowData));
        });

        return models;
    }

    /**
     * Create a new instance of model and saves its data to database.
     * 
     * @param data represents data of model
     * @returns promised created model
     */
    public static async create(data: ModelAttributes): Promise<Model> {
        if (this.name === Model.name) {
            throw new Error('A base model class cannot be querable!');
        }

        const model = new this();
        
        model.fill(data);
        await model.save();

        return model;
    }

    /**
     * Delete model from database by given id.
     * 
     * @param id 
     * @returns 
     */
    public static async delete(id: number): Promise<number> {
        if (this.name === Model.name) {
            throw new Error('A base model class cannot be querable!');
        }

        const result = await DB.execute(
            `DELETE FROM ${this.getTableName()} WHERE id = ?`
        , [id]) as ResultSetHeader;

        if (!result) {
            return 0;
        }

        return result.affectedRows;
    }

    /**
     * Delete models from database by given ids.
     * 
     * @param ids represents id attributes of models
     * @returns promised deleted records from database
     */
    public static async deleteMany(ids: number[]): Promise<number> {
        if (this.name === Model.name) {
            throw new Error('A base model class cannot be querable!');
        }

        const result = await DB.execute(
            `DELETE FROM ${this.getTableName()} WHERE id IN (${ids.join(',')})`
        ) as ResultSetHeader;

        if (!result) {
            return 0;
        }

        return result.affectedRows;
    }



    /**
     * Get table name based on model class name or on defined static field in class.
     * 
     * @returns {string} table name
     */
    protected static getTableName(): string {
        if (Model.tableName !== '') return Model.tableName;

        let splittedClsName = this.name.split(/(?=[A-Z])/);
        splittedClsName = splittedClsName.map(tokenedName => tokenedName.toLowerCase());

        return splittedClsName.join('_') + 's';
    }

    /**
     * Instatiate a model with given DB raw data.
     * 
     * @param data {RawData} represents record data in table.
     * @returns {Model} a new instance of model
     */
    protected static instantiate(data: RowData): Model {
        const model = new this();
        
        Object.keys(data).forEach((key: string) => {
            if (model.hasOwnProperty(key)) {
                model.attributes[key] = data[key];
            }
        });

        return model;
    }
}