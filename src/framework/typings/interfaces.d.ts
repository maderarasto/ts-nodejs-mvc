declare namespace Interfaces {
    /**
     * Represetns component that can automatically be loaded by factory loader.
     */
    export interface Loadable {

    }

    /**
     * Represents component that can be injected to controllers
     */
    export interface Injectable {

    }

    /** 
     * Represents an component with business logic that can be automatically injected in controller 
     */
    export interface Service extends Injectable {
        
    }
}