import {
    Response as ExpressResponse
} from 'express';

export class ErrorHandler {
    handle(err: Error, res: ExpressResponse) {
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