import { Request } from 'express'
import Controller from "./Controller";
import App from '../App';

export default class IndexController extends Controller {
    /**
     *
     */
    constructor(app: App) {
        super(app);
    }

    async index(req: Request) {
        

        this.response.render('home', {
            userId: req.session.userId
        });
    }
}