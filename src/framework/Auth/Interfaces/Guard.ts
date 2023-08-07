import User from "../User";

/**
 * Represents a guard that can validate user credentials and access to authenticated user.
 */
export default interface Guard {
    /**
     * Check if user was already authentificated.
     */
    check(): Promise<boolean>

    /**
     * Get an authentificated user.
     */
    getUser(): Promise<User|null>

    /**
     * Checks if given credentials are valid.
     * @param credentials 
     */
    validate(credentials: Auth.Credentials): Promise<boolean>

    /**
     * Forget authentificaiton of user.
     */
    forgetUser(): Promise<void>
}