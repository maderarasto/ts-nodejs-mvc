import {Controller, ContainerDI } from "./";
import { AuthService } from '../services';

export default class IndexController extends Controller {
    private authService: AuthService;

    constructor(containerDI: ContainerDI) {
        super(containerDI);

        this.authService = containerDI.authService as AuthService;
    }

    async index() {
        this.response.render('home', {
            userId: this.request.session.userId
        });
    }
}