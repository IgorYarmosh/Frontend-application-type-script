import {Common} from "../../utils/common";
import {CustomHttp} from "../../services/custom-http";
import config from "../../../config/config";
import {CategoriesIncomeType} from "../../types/categories-income.type";
import {DefaultResponseType} from "../../types/default-response.type";

export class CreateIncome {

    readonly btnCancel: HTMLElement | null;
    private btnCreate: HTMLElement | null;
    readonly urlIncome: string | null;
    private createInput: HTMLInputElement | null;
    
    constructor() {
        this.btnCancel = document.getElementById('cancel');
        this.btnCreate = document.getElementById('create');
        this.urlIncome = '#/income';
        this.createInput = document.getElementsByClassName('create-input')[0] as HTMLInputElement;
        this.process();
        this.cancelCreation();
    }

    private process(): void {
        if (this.createInput) {
            this.createInput.onchange = () => {
                if ((this.createInput as HTMLInputElement).value && (this.createInput as HTMLInputElement).value !== '') {
                    if (this.btnCreate) {
                        this.btnCreate.onclick = () => this.createCategoryIncome()
                    }
                } else {
                    console.log("Ошибка!");
                }
            }
        }
    }

    private async createCategoryIncome(): Promise<void> {
        if (!(this.createInput as HTMLInputElement).value) return;
        const result: CategoriesIncomeType | DefaultResponseType = await CustomHttp.request(config.host + '/categories/income', 'POST', {
            "title": (this.createInput as HTMLInputElement).value,
        });
        if (result) {
            if ((result as DefaultResponseType).error) {
                throw new Error((result as DefaultResponseType).message);
            }
        }
        console.log("Категория успешно создана!");
        location.href = '#/income';
    }

    private cancelCreation(): void {
        if (this.btnCancel && this.urlIncome) {
            Common.move(this.btnCancel, this.urlIncome);
        }
    }
}
