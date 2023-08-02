import Controller from '../framework/Routing/Controller';

export default class IndexController extends Controller {
    constructor(containerDI: Routing.ContainerDI) {
        super(containerDI);
    }

    async index() {
        this.response.render('home', {
            userId: 0
        });
    }
}