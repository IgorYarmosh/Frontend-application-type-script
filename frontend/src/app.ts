import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Router} from "./router";
import {Sidebar} from "./components/sidebars";

class App {
    private router: Router;

    constructor() {
        this.router = new Router();
        window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this));
        window.addEventListener('popstate', this.handleRouteChanging.bind(this));
    }

    private handleRouteChanging(): void {
        this.router.openRoute();
        new Sidebar();
    }
}
(new App());