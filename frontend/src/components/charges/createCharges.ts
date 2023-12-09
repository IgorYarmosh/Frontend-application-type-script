import {Common} from "../../utils/common";
import {CustomHttp} from "../../services/custom-http";
import config from "../../../config/config";
import {CreateChargesType} from "../../types/create-charges.type";
import {DefaultResponseType} from "../../types/default-response.type";

export class CreateCharges {

    readonly btnCancel: HTMLElement | null;
    readonly  btnCreate: HTMLElement | null;
    readonly urlCharges: string | null;
    readonly  createInput: HTMLInputElement | null;

    constructor() {
        this.btnCancel = document.getElementById('cancel');
        this.btnCreate = document.getElementById('create');
        this.urlCharges = '#/charges';
        this.createInput = document.getElementsByClassName('create-input')[0] as HTMLInputElement;
        this.process();
        this.cancelCreation();
    }

    private process(): void {
        if (this.createInput) {
            this.createInput.onchange = () => {
                if ((this.createInput as HTMLInputElement).value && (this.createInput as HTMLInputElement).value !== '' && this.btnCreate) {
                    this.btnCreate.onclick = () => this.createCategoryCharges()
                } else {
                    console.log("Ошибка");
                }
            }
        }
    }

    private async createCategoryCharges(): Promise<void> {
        if (!(this.createInput as HTMLInputElement).value) return;

        const result: DefaultResponseType | CreateChargesType = await CustomHttp.request(config.host + '/categories/expense', 'POST', {
            "title": (this.createInput as HTMLInputElement).value,
        });
        if (result) {
            if ((result as DefaultResponseType).error) {
                throw new Error((result as DefaultResponseType).message);
            }
        }
        console.log("Категория успешно создана!");
        location.href = '#/charges';
    }

    private cancelCreation(): void {
        if (this.btnCancel && this.urlCharges) {
            Common.move(this.btnCancel, this.urlCharges);
        }
    }
}
