import User from "../User";

export default interface Guard {
    /**
     * Check if user was already authentificated.
     */
    check(): boolean

    /**
     * Get an authentificated user.
     */
    getUser(): Promise<User|undefined>

    /**
     * Checks if given credentials are valid.
     * @param credentials 
     */
    validate(credentials: Auth.Credentials): Promise<boolean>
}