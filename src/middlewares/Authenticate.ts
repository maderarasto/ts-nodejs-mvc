import Middleware from './Middleware';

export default class Authenticate extends Middleware {
    handle(): boolean {
        throw new Error('Method not implemented.');
    }
    
}