import Controller, { DIContainer } from "./Controller";
import { AuthService } from '../services';

export default class IndexController extends Controller {
    private authService: AuthService;

    constructor(container: DIContainer) {
        super(container);

        this.authService = container.authService as AuthService;
    }

    async index() {
        this.response.render('home', {
            userId: this.request.session.userId
        });
    }
}