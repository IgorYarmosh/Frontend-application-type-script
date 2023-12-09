import {Common} from "../../utils/common";
import {CustomHttp} from "../../services/custom-http";
import config from "../../../config/config";
import {CreateChargesType} from "../../types/create-charges.type";
import {DefaultResponseType} from "../../types/default-response.type";

export class Charges {
    // public modal: string | null;
    readonly plusBtn: Element | null;
    readonly url: string;
    private chargesCategories: CreateChargesType[] | null;

    constructor() {
        // this.modal = null;
        this.plusBtn = document.getElementsByClassName('charges-item')[0];
        this.url = '#/createCharges';
        this.chargesCategories = null;
        this.init();
    }

    private async init(): Promise<void> {
        try {
            const result: CreateChargesType[] | DefaultResponseType = await CustomHttp.request(config.host + '/categories/expense');
            if (result) {
                this.chargesCategories = result as CreateChargesType[];
            }
        } catch (error) {
            return console.log(error);
        }
        this.showCategories();
    }

    private showCategories(): void {
        const chargesItemsElement: Node | null = document.getElementById('charges-items');
        if (!chargesItemsElement) return;

        if (this.chargesCategories && this.chargesCategories.length > 0) {
            this.chargesCategories.forEach((category: CreateChargesType) => {
                const chargesItemElement: HTMLElement | null = document.createElement('div');
                chargesItemElement.className = 'income-item border rounded-3';

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
                chargesItemElement.appendChild(itemTitleElement);
                chargesItemElement.appendChild(itemButtonsElement);
                chargesItemsElement.appendChild(chargesItemElement);
            })
            const chargesItemAdd: HTMLElement | null = document.getElementById('add');
            if (chargesItemAdd) {
                chargesItemsElement.appendChild(chargesItemAdd);
            }
        }
        this.editCharges();
        Common.deleteCategory('/categories/expense/');
        this.createCharges();

    }

    private editCharges(): void {
        const editBtn: HTMLCollectionOf<HTMLElement> | null = document.getElementsByClassName('edit') as HTMLCollectionOf<HTMLElement>;

        if (editBtn) {
            Array.from(editBtn).forEach((btn: HTMLElement) => {
                btn.onclick = e => {
                    const categoryChargesId: string | null = (e.target as HTMLElement).getAttribute('data-id');
                    if (categoryChargesId) {
                        localStorage.setItem('categoryChargesId', categoryChargesId);
                    }

                    const chargesCategory: string | null = (e.target as HTMLElement).getAttribute('category-name');
                    if (chargesCategory) {
                        localStorage.setItem('chargesCategory', chargesCategory);
                    }
                    location.href = '#/editCharges';
                }
            })
        }
    }
    private createCharges(): void {
        Common.move(this.plusBtn as HTMLElement, this.url);
    }
}
