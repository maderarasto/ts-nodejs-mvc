import { Request, Response } from 'express'
import Controller from "./Controller";

export default class IndexController extends Controller {
    async index(req: Request, res: Response) {
        this.response.render('home');
    }
}