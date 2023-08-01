declare namespace Interfaces {
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