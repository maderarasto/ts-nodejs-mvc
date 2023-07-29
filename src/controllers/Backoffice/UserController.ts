import Controller from "../Controller";

export default class UserController extends Controller {
    /**
     *
     */
    constructor() {
        super();
    }

    async index() {
        this.response.render('home', {
            userId: 25
        });
    }
}