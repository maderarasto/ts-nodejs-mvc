import { log } from "console";

export default class DbEntity {
    protected static readonly PRIMARY_KEY = 'id';

    protected static tableName = 'table';

    protected static useTable(tableName: string) {
        return function <T extends {new(...args: any[]): {}}>(constr: T, context: ClassDecoratorContext) {
            DbEntity.tableName = tableName;
            return class extends constr {
                constructor(...args: any[]) {
                    super(...args);
                }
            }
        }
    }

    protected static useColumn(columnName: string) {
        return function (_: any, {addInitializer}: ClassFieldDecoratorContext) {
            addInitializer(function () {
                Object.defineProperty(this, columnName, {
                    get() {
                        console.log(this.attributes);
                        return this.attributes[columnName];
                    },
                    set(value) {
                        this.attributes[columnName] = value;
                    }
                });
            });
        }
    }
}