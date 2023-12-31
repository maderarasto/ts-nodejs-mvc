/**
 * Represents a manager thah can provide specific or all instances of component
 */
export default interface Provider<K, T> {
    /**
     * Get an instance of component by its key
     * @param key key of component
     */
    get(key: K): T;

    /**
     * Get all instances of component.
     */
    all() : Map<K, T>;
}