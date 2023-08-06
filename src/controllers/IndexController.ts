import Controller from '../framework/Routing/Controller';

export default class IndexController extends Controller {
    constructor(containerDI: Routing.ContainerDI) {
        super(containerDI);
    }

    async index() {
        console.log(this.request.session.userId);
        console.log(await this.auth?.isAuthenticated());

        this.response.render('home', {
            userId: 0
        });
    }
}