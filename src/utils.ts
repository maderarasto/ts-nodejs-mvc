import { Response } from "express";
import { ErrorResponse } from "./controllers/Controller";

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

export class ErrorHandler {
    handle(err: Error, res: Response) {
        // const error: ErrorResponse = {
        //     code: 400,
        //     error: {
        //         message: err.message,
        //         callstack: err.stack?.split('\n') ?? undefined
        //     }
        // };

        res.status(400);
        res.end(`
            <h1>Error ocurred</h1>
        `);
    }
}