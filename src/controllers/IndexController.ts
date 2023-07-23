import { Request, Response } from 'express'
import Controller from "./Controller";
import User from '../models/User';
import { AuthService } from '../services';

export default class IndexController extends Controller {
    async index(req: Request, res: Response) {
        

        this.response.render('home', {
            userId: req.session.userId
        });
    }
}