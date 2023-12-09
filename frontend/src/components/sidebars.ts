import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {BalanceType} from "../types/balance.type";

export class Sidebar {
    constructor() {
        this.init();
    }

    private init(): void {
        const urlRoute: string | null = window.location.hash.split('?')[0];
        if (urlRoute !== "#/login" && urlRoute !== "#/signup") {
            Sidebar.showBalance();
        }
        this.choosePage();
        this.activePage();
    }

    private static async showBalance(): Promise<void> {
        {
            const balance: HTMLElement | null = document.getElementById('balance');

            try {
                const result: { balance: number } = await CustomHttp.request(config.host + '/balance')
                if (result) {
                    if (balance) {
                        balance.innerText = (result as BalanceType).balance + "$";
                    }
                }

            } catch (error) {
                return console.log(error);
            }
        }
    }


    private choosePage(): void {
        const pages: HTMLCollectionOf<HTMLElement> | null = document.getElementsByClassName('nav-item') as HTMLCollectionOf<HTMLElement>;
        const pagesElements = Array.from(pages);

        pagesElements.forEach((page: HTMLElement) => {
            page.onclick = () => {
                switch (page.innerText) {
                    case 'Главная':
                        location.href = '#/main';
                        break;
                    case 'Доходы & Расходы':
                        location.href = '#/incomeAndCharges';
                        break;
                    case 'Доходы':
                        location.href = '#/income';
                        break;
                    case 'Расходы':
                        location.href = '#/charges';
                        break;
                }
            }
        })
    }

    private activePage(): void {
        const urlRoute: string | null = window.location.hash.split('?')[0];
        const links: HTMLCollectionOf<HTMLElement> | null = document.getElementsByClassName('nav-link') as HTMLCollectionOf<HTMLElement>;
        const linksArr: HTMLElement[] = Array.from(links);
        const categories: HTMLElement | null = document.getElementById('categories');
        const income: HTMLElement | null = document.getElementById('income');
        const charges: HTMLElement | null = document.getElementById('charges');
        const incomeAndCharges: HTMLElement | null = document.getElementById('incomeAndCharges');

        linksArr.forEach(link => {
            link.onclick = () => {
                linksArr.forEach(item => item.classList.remove('active'));
                link.classList.add('active');
            }
        })

        if (!urlRoute) return;

        if (urlRoute === '#/createIncome' || urlRoute === '#/editIncome' || urlRoute === '#/createIncomeAndCharges' || urlRoute === '#/editIncomeAndCharges') {
            linksArr.forEach((link: HTMLElement) => link.classList.remove('active'));
            if (categories) {
                categories.classList.add('active');
            }
            if (income) {
                income.classList.add('active');
            }
        } else if (urlRoute === '#/createCharges' || urlRoute === '#/editCharges') {
            linksArr.forEach((link: HTMLElement) => link.classList.remove('active'));
            if (categories) {
                categories.classList.add('active');
            }
            if (charges) {
                charges.classList.add('active');
            }
        } else if (urlRoute === '#/incomeAndCharges') {
            linksArr.forEach((link: HTMLElement) => link.classList.remove('active'));
            if (incomeAndCharges) {
                incomeAndCharges.classList.add('active');
            }
        }
           }
}



