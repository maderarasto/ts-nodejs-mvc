/**
 * Get value of environment variable from .env file.
 * 
 * @param key Key of variable in .env file
 * @param defaultValue Default value used if given isn't found
 * @returns string value of env variable
 */
export function getenv(key: string, defaultValue?: string): string {
    if (!(key in process.env)) {
        return defaultValue as string;
    }

    return process.env[key] as string;
}