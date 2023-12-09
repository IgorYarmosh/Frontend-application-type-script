import {Common} from "../../utils/common";
import {CustomHttp} from "../../services/custom-http";
import config from "../../../config/config";
import {CategoriesIncomeType} from "../../types/categories-income.type";
import {DefaultResponseType} from "../../types/default-response.type";

export class Income {

    readonly plusBtn: Element | null;
    readonly url: string;
    private incomeCategories: CategoriesIncomeType[] | null;

    constructor() {
        this.plusBtn = document.getElementsByClassName('income-item')[0];
        this.url = '#/createIncome';
        this.incomeCategories = null;
        this.init();
    }

    private async init(): Promise<void> {
        try {
            const result: CategoriesIncomeType[] | DefaultResponseType = await CustomHttp.request(config.host + '/categories/income');
            if (result) {
                if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                }
                this.incomeCategories = result as CategoriesIncomeType[];
            }
        } catch (error) {
            return console.log(error);
        }
        this.showCategories();
    }

    private showCategories(): void {
        const incomeItemsElement: Node | null = document.getElementById('income-items');
        if (!incomeItemsElement) return;

        if (this.incomeCategories && this.incomeCategories.length > 0) {
            this.incomeCategories.forEach(category => {
                const incomeItemElement: HTMLElement | null = document.createElement('div');
                incomeItemElement.className = 'income-item border rounded-3';

                const itemTitleElement: HTMLElement | null = document.createElement('h2');
                if (itemTitleElement) {
                    itemTitleElement.className = 'item-title mb-2 fs-3';
                    itemTitleElement.innerText = category.title;
                }

                const itemButtonsElement: HTMLElement | null = document.createElement('div');
                if (itemButtonsElement) {
                    itemButtonsElement.className = 'item-buttons';
                }

                const buttonEditElement: HTMLElement | null = document.createElement('button');
                if (buttonEditElement) {
                    buttonEditElement.className = 'btn btn-primary me-2 edit';
                    buttonEditElement.innerText = 'Редактировать';
                    buttonEditElement.setAttribute('data-id', category.id.toString());
                    buttonEditElement.setAttribute('category-name', category.title);
                }


                const buttonDeleteElement: HTMLElement | null = document.createElement('button');
                if (buttonDeleteElement) {
                    buttonDeleteElement.className = 'btn btn-danger delete';
                    buttonDeleteElement.innerText = 'Удалить';
                    buttonDeleteElement.setAttribute('data-bs-toggle', 'modal');
                    buttonDeleteElement.setAttribute('data-bs-target', '#modal');
                    buttonDeleteElement.setAttribute('data-id', category.id.toString());
                    buttonDeleteElement.setAttribute('category-name', category.title);
                }


                itemButtonsElement.appendChild(buttonEditElement);
                itemButtonsElement.appendChild(buttonDeleteElement);

                incomeItemElement.appendChild(itemTitleElement);
                incomeItemElement.appendChild(itemButtonsElement);

                incomeItemsElement.appendChild(incomeItemElement);
            })

            const incomeItemAdd: HTMLElement | null = document.getElementById('add');
            if (incomeItemAdd) {
                incomeItemsElement.appendChild(incomeItemAdd);
            }
        }

        this.editIncome();
        Common.deleteCategory('/categories/income/');
        this.createIncome();
    }

    private editIncome(): void {
        const editBtn: HTMLCollectionOf<HTMLElement> = document.getElementsByClassName('edit') as HTMLCollectionOf<HTMLElement>;
        if (editBtn) {
            Array.from(editBtn).forEach((btn: HTMLElement) => {
                btn.onclick = e => {
                    const incomeCategoryId: string | null = (e.target as HTMLElement).getAttribute('data-id');
                    if (incomeCategoryId) {
                        localStorage.setItem('incomeCategoryId', incomeCategoryId);
                    }

                    const incomeCategory: string | null = (e.target as HTMLElement).getAttribute('category-name');
                    if (incomeCategory) {
                        localStorage.setItem('incomeCategory', incomeCategory);
                    }
                    location.href = '#/editIncome';
                }
            })
        }
    }

    private createIncome(): void {
        if (this.plusBtn && this.url) {
            Common.move(this.plusBtn as HTMLElement, this.url)
        }
    }
}