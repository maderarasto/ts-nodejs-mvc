import { Request, Response } from 'express'
import Controller from "./Controller";
import User from '../models/User';

export default class IndexController extends Controller {
    async index(req: Request, res: Response) {
        console.log(req.session.id);
        this.response.render('home');
    }
}