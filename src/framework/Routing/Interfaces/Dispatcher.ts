/**
 * Represents a manager that can dispatch request based on registered route.
 */
export default interface Dispatcher {
    /**
     * Dispatch an action for incoming request based in registered route.
     * @param route registered route
     * @param req incoming request
     * @param res functionality for responding
     */
    dispatch(route: Routing.Route, req: Express.Request, res: Express.Response): void;
}