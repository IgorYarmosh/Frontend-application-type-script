import {Income} from "./components/income/income";
import {CreateIncome} from "./components/income/createIncome";
import {EditIncome} from "./components/income/editIncome";
import {Charges} from "./components/charges/charges";
import {CreateCharges} from "./components/charges/createCharges";
import {EditCharges} from "./components/charges/editCharges";
import {IncomeAndCharges} from "./components/incomeAndCharges/incomeAndCharges";
import {CreateIncomeAndCharges} from "./components/incomeAndCharges/createIncomeAndCharges";
import {EditIncomeAndCharges} from "./components/incomeAndCharges/editIncomeAndCharges";
import {Form} from "./components/form";
import {Auth} from "./services/auth";
import {RouteType} from "./types/route.type";
import {UserInfoType} from "./types/user-info.type";
import {MainIncome} from "./components/main-income";

export class Router {
    readonly contentElement: HTMLElement | null;
    readonly stylesElement: HTMLElement | null;
    readonly titleElement: HTMLElement | null;

    private routes: RouteType[];

    constructor() {
        this.contentElement = document.getElementById('content');
        this.stylesElement = document.getElementById('styles');
        this.titleElement = document.getElementById('title');
        this.routes = [
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/login/signup.html',
                styles: "styles/form.css",
                load: () => new Form('signup')
            },
            {
                route: '#/login',
                title: 'Вход',
                template: 'templates/login/login.html',
                styles: "styles/form.css",
                load: () => new Form('login')
            },

            {
                route: '#/main',
                title: 'Главная',
                template: 'templates/main.html',
                styles: "styles/main.css",
                load: () => new MainIncome()
            },
            {
                route: '#/income',
                title: 'Доходы',
                template: 'templates/income/income.html',
                styles: "styles/category.css",
                load: () => new Income()
            },
            {
                route: '#/createIncome',
                title: 'Создание категории доходов',
                template: 'templates/income/createIncome.html',
                styles: "styles/categoryActions.css",
                load: () => new CreateIncome()
            },
            {
                route: '#/editIncome',
                title: 'Редактирование категории доходов',
                template: 'templates/income/editIncome.html',
                styles: "styles/categoryActions.css",
                load: () => new EditIncome()
            },
            {
                route: '#/charges',
                title: 'Расходы',
                template: 'templates/charges/charges.html',
                styles: "styles/category.css",
                load: () => new Charges()
            },
            {
                route: '#/createCharges',
                title: 'Создание категории расходов',
                template: 'templates/charges/createCharges.html',
                styles: "styles/categoryActions.css",
                load: () => new CreateCharges()
            },
            {
                route: '#/editCharges',
                title: 'Редактирование категории расходов',
                template: 'templates/charges/editCharges.html',
                styles: "styles/categoryActions.css",
                load: () => new EditCharges()
            },
            {
                route: '#/incomeAndCharges',
                title: 'Доходы и расходы',
                template: 'templates/incomeAndCharges/incomeAndCharges.html',
                styles: "styles/incomeAndCharges.css",
                load: () => new IncomeAndCharges()
            },
            {
                route: '#/createIncomeAndCharges',
                title: 'Создание дохода/расхода',
                template: 'templates/incomeAndCharges/createIncomeAndCharges.html',
                styles: "styles/incomeAndChargesActions.css",
                load: () => new CreateIncomeAndCharges()
            },
            {
                route: '#/editIncomeAndCharges',
                title: 'Редактирование дохода/расхода',
                template: 'templates/incomeAndCharges/editIncomeAndCharges.html',
                styles: "styles/incomeAndChargesActions.css",
                load: () => new EditIncomeAndCharges()
            },

        ]
    }

    public async openRoute(): Promise<void> {
        const profileElement: HTMLElement | null = document.getElementById('personal-info');
        const profileFullNameElement: HTMLElement | null = document.getElementById('profile-full-name');

        const urlRoute: string = window.location.hash.split('?')[0];
        if (urlRoute === '#/logout') {
            const result: boolean = await Auth.logout();
            if (result) {
                window.location.href = '#/login';
                return;
            }
        }
        
        const newRoute: RouteType | undefined = this.routes.find(item => item.route === window.location.hash);

        if (!newRoute) {
            window.location.href = '#/signup';
            return;
        }

        if (!this.contentElement || !this.stylesElement
            || !this.titleElement || !profileElement || !profileFullNameElement) {
            if (urlRoute === '#/logout') {
                return
            } else {
                window.location.href = '#/logout';
                return;
            }
        }

        this.contentElement.innerHTML =
            await fetch(newRoute.template).then(response => response.text());
        this.stylesElement.setAttribute('href', newRoute.styles);
        this.titleElement.innerText = newRoute.title;


        const userInfo: UserInfoType | null = Auth.getUserInfo();
        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);
        if (userInfo && accessToken) {
            profileElement.style.display = 'block';
            profileFullNameElement.innerText = userInfo.fullName;
        } else {
            profileElement.style.display = 'none';
        }

        newRoute.load();
    }
}