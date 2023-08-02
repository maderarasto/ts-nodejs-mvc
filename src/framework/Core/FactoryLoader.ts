import FileSystem from "./FileSystem";

type ComponentType = 'Controller' | 'Service';

/**
 * Represents an manager that can automatically load classes from specific directory.
 */
export default abstract class FactoryLoader<T> {
    
    protected componentFactory: Map<string, (...args: any) => T>;
    
    constructor(
        private componentType: ComponentType, 
        private componentsDir: string
    ) {
        this.componentFactory = new Map();
        this.load();
    }

    /**
     * Loads all components from given component directory property.
     * Ignores all script files that not contain component type property in their names.
     */
    private load() {
        if (!FileSystem.exists(this.componentsDir)) {
            return;
        }

        const dirFiles = FileSystem.files(this.componentsDir, true);
        const componentFiles = dirFiles.filter(filePath => {
            const fileExt = FileSystem.extension(filePath);
            const fileName = FileSystem.basename(filePath);

            return fileExt === '.ts'
                && fileName.includes(this.componentType)
                && fileName !== `${this.componentType}.ts`;
        });

        componentFiles.forEach(componentFile => {
            const componentKey = this.resolveComponentKey(componentFile);
            const componentFactory = (...args: any) => {
                const constructor = require(componentFile).default;
                return new constructor(...args) as T;
            }

            this.componentFactory.set(componentKey, componentFactory);
        })
    }

    /**
     * Resolve a component key based on combination of folders and name of component file.
     * @param componentFile file path to component file.
     * @returns component key.
     */
    protected resolveComponentKey(componentFile: string) {
        let componentKey = componentFile.replace(this.componentsDir + FileSystem.sep, '');
        componentKey = componentKey.replaceAll('\\', '/');
        componentKey = componentKey.replace('.ts', '');

        return componentKey;
    }
}