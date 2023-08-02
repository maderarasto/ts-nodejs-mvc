/// <reference types="./interfaces.d.ts" />

namespace Application {
    type Config = {
        name: string
        port: number

        database: {
            credentials: Database.Credentials
        },

        session: {
            driver: Auth.Session.Driver
            files: string
            secret: string
            lifetime: numbe
        }

        routes?: Routing.Route[]

        views: {
            dir: string
        }

        services: {
            dir: string
        }

        controllers: {
            dir: string
        }
    };
}

namespace Auth {
    /**
     * Credentials required to log in as user.
     */
    type Credentials = {
        login: string,
        password: string
    };

    type Session = import('express-session').Session & Partial<import('express-session').SessionData>;

    namespace Session {
        type Driver = 'file' | 'database';
    }
}

namespace Database {
    /**
     * Credentials required to connect to database.
     */
    type Credentials = {
        host: string
        user: string
        password: string
        database: string
    }

    /**
     * Raw data with properties based on record in DB table.
     */
    type RowData = import('mysql2').RowDataPacket;

    /**
     * Result header with information about create, update and delete DB operations.
     */
    type ResultHeader = import('mysql2').ResultSetHeader;

    type Result = (
        Database.RowData[] |
        Database.RowData[][] |
        Database.ResultHeader |
        Database.ResultHeader[]
    );

    /**
     * Represents parameters that can be passed to SQL execution.
     */
    type Parameter = (string | number | boolean | null);

    namespace Model {
        /**
         * Represent possible values for model attributes.
         */
        type AttributeValue = boolean | number | string | null;

        /**
         * Represents list of attributes of model.
         */
        type Attributes = {
            [key: string]: Database.Model.AttributeValue
        }
    }
}

namespace Routing {
    /**
     * Represents HTTP method of incoming request.
     */
    type Method = ('GET' | 'POST'  | 'PUT' | 'PATCH' | 'DELETE')

    /**
     * Represents route of application that are binded to incoming requests.
     */
    type Route = {
        path: string,
        name?: string,
        method: Routing.Method,
        controller: string,
        action: string,
    }

    /**
     * Represents container for dependency injection.
     */
    type ContainerDI = {
        [key: string]: Interfaces.Injectable
    }

    /**
     * Represents error data as JSON response.
     */
    type ErrorResponse = {
        code: number,
        error: {
            message: string,
            callstack?: string[]
        }
    }
}