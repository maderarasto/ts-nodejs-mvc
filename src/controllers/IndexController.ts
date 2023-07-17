import { Request, Response } from 'express'
import Controller from "./Controller";
import User from '../models/User';

export default class IndexController extends Controller {
    async index(req: Request, res: Response) {
        console.log(await User.auth({
            login: 'rmadera',
            password: '345938Ab'
        }));

        this.response.render('home');
    }
}