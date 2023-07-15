import { Request, Response } from 'express'
import Controller from "./Controller";
import User from '../models/User';

export default class IndexController extends Controller {
    
    constructor() {
        super();
        
    }

    async index(req: Request, res: Response) {
        res.render('home');
    }
}