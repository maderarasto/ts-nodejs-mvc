"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DbEntity {
    static useTable(tableName) {
        return function (constr, context) {
            DbEntity.tableName = tableName;
            return class extends constr {
                constructor(...args) {
                    super(...args);
                }
            };
        };
    }
    static column(_, { name, addInitializer }) {
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
DbEntity.PRIMARY_KEY = 'id';
DbEntity.tableName = '';
exports.default = DbEntity;
