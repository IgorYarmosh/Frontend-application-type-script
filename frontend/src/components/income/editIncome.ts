import {Common} from "../../utils/common";
import {CustomHttp} from "../../services/custom-http";
import config from "../../../config/config";
import {CategoriesIncomeType} from "../../types/categories-income.type";
import {DefaultResponseType} from "../../types/default-response.type";

export class EditIncome {

    readonly btnCancel: HTMLElement | null;
    private btnSave: HTMLElement | null;
    readonly url: string | null;
    private editInput: HTMLInputElement | null;

    constructor() {
        this.btnCancel = document.getElementById('cancel');
        this.btnSave = document.getElementById('save');
        this.url = '#/income';
        this.editInput = document.getElementsByClassName('edit-input')[0] as HTMLInputElement;
        this.process();
        this.cancelEdition();
    }

    private process(): void {
        const categoryName: string | null = localStorage.getItem('incomeCategory');
        if (this.editInput) {
            if (categoryName) {
                this.editInput.value = categoryName;
            } else {
                this.editInput.value = 'no name category';
            }
        }

        if (this.btnSave) {
            this.btnSave.onclick = () => this.saveEditing()
        }
    }


    private async saveEditing(): Promise<void> {
        const categoryId: string | null = localStorage.getItem('incomeCategoryId');
        if (!(this.editInput as HTMLInputElement).value) return;

        const result: CategoriesIncomeType | DefaultResponseType = await CustomHttp.request(config.host + '/categories/income/' + categoryId, 'PUT', {
            "title": (this.editInput as HTMLInputElement).value,
        });
        if (result) {
            if ((result as DefaultResponseType).error) {
                throw new Error((result as DefaultResponseType).message);
            }
        }
        if (this.url) {
            location.href = this.url;
        }
    }


    private cancelEdition(): void {
        if (this.btnCancel && this.url) {
            Common.move(this.btnCancel, this.url);
        }
    }
}
