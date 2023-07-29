import { Request } from 'express'
import Controller from "./Controller";
import App from '../App';

export default class IndexController extends Controller {
    /**
     *
     */
    constructor() {
        super();
    }

    async index() {
        

        this.response.render('home', {
            userId: this.request.session.userId
        });
    }
}