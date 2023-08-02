import crypto from 'crypto';

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
export function Field(...args: FieldOption[]) {
    return function (_: any, {kind, name, addInitializer}: ClassFieldDecoratorContext) {
        if (kind !== 'field') return;

        addInitializer(function () {
            Object.defineProperty(this, name, {
                get: function () {
                    return this.attributes[name];
                },
                set: function (value: Database.Model.AttributeValue) {
                    if (value && args.includes('hashable')) {
                        value = crypto.createHash('md5').update(value as string).digest('hex');
                    }

                    this.attributes[name] = value;
                }
            })
        });
    }
}