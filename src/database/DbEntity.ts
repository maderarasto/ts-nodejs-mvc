import { log } from "console";

export default class DbEntity {
    protected static readonly PRIMARY_KEY = 'id';

    protected static tableName = '';

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

    protected static column(_: any, {name, addInitializer}: ClassFieldDecoratorContext) {
        addInitializer(function () {
            Object.defineProperty(this, name, {
                get() {
                    return this.attributes[name];
                },
                set(value) {
                    this.attributes[name] = value;
                }
            });
        });
    }
}