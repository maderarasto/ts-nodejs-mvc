import User from "../User";

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