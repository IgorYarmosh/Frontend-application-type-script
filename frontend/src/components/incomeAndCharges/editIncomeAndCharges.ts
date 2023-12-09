import {Common} from "../../utils/common";
import {CustomHttp} from "../../services/custom-http";
import config from "../../../config/config";
import {CategoriesIncomeType} from "../../types/categories-income.type";
import {OperationType} from "../../types/operation.type";
import {DefaultResponseType} from "../../types/default-response.type";

export class EditIncomeAndCharges {

    readonly btnCreate: HTMLElement | null;
    readonly btnCancel: HTMLElement | null;
    readonly url: string | null;
    readonly editingOperation: OperationType | null = null;
    readonly inputType: HTMLInputElement | null;
    readonly dateInput: HTMLInputElement | null;
    readonly categoryInput: HTMLSelectElement | null;
    readonly amountInput: HTMLInputElement | null;
    readonly commentInput: HTMLInputElement | null;
    private operation: string | null;
    private incomeCategories: CategoriesIncomeType[] | null;
    private chargesCategories: CategoriesIncomeType[] | null;
    private date: string | null;

    constructor() {
        this.btnCreate = document.getElementById('create');
        this.btnCancel = document.getElementById('cancel');
        this.url = '#/incomeAndCharges';
        let editingOperationName: string | null = localStorage.getItem('editingOperation');
        if (editingOperationName) {
            this.editingOperation = JSON.parse(editingOperationName);
        }
        this.inputType = document.getElementById('inputType') as HTMLInputElement;
        this.dateInput = document.getElementById('inputDate') as HTMLInputElement;
        this.categoryInput = document.getElementById('inputCategory') as HTMLSelectElement;
        this.amountInput = document.getElementById('inputAmount') as HTMLInputElement;
        this.commentInput = document.getElementById('inputComment') as HTMLInputElement;
        this.operation = null;
        this.incomeCategories = null;
        this.chargesCategories = null;
        this.date = null;

        this.init();
        this.cancelCreation();
    }

    private init(): void {
        if (!this.editingOperation) return;

        if (this.editingOperation.type === 'expense') {
            if (this.inputType) {
                this.inputType.value = 'расход';
            }
            this.operation = 'expense';
        } else if (this.editingOperation.type === 'income') {
            if (this.inputType) {
                this.inputType.value = 'доход';
            }
            this.operation = "income";
        }
        this.getCategories();

        if (this.amountInput) {
            this.amountInput.value = this.editingOperation.amount + '$';
            this.amountInput.onclick = () => {
                (this.amountInput as HTMLInputElement).type = 'number';
            }
        }

        if (this.amountInput) {
            this.amountInput.onblur = () => {
                (this.amountInput as HTMLInputElement).type = 'text';
                (this.amountInput as HTMLInputElement).value = (this.amountInput as HTMLInputElement) + '$';
            }
        }

        let date: string[] = this.editingOperation.date.split('.');
        let modifiedDate: string[] = date.reverse();
        this.date = modifiedDate.join('-');

        if (this.dateInput) {
            this.dateInput.type = 'text';
            this.dateInput.value = this.editingOperation.date;

            this.dateInput.onclick = () => {
                (this.dateInput as HTMLInputElement).type = 'date';
            }

            this.dateInput.onchange = e => {
                this.date = (e.target as HTMLInputElement).value;
            }
        }

        if (this.commentInput) {
            this.commentInput.value = this.editingOperation.comment;
            this.commentInput.onchange = e => {
                (this.commentInput as HTMLInputElement).value = (e.target as HTMLInputElement).value;
            }
        }

        this.updateOperation();
    }

    private async getCategories(): Promise<void> {
        this.incomeCategories = await CustomHttp.request(config.host + '/categories/income');
        this.chargesCategories = await CustomHttp.request(config.host + '/categories/expense');

        if (!this.incomeCategories || !this.chargesCategories) return;
        if (this.operation === "income") {
            this.incomeCategories.forEach(item => {
                const option: HTMLOptionElement  | null = document.createElement('option');
                if (option) {
                    option.text = item.title;
                    option.value = item.id.toString();
                    if (this.categoryInput) {
                        this.categoryInput.appendChild(option);
                    }
                }
            })
        } else if (this.operation === "expense") {
            this.chargesCategories.forEach(item => {
                const option: HTMLOptionElement  | null = document.createElement('option');
                if (option) {
                    option.text = item.title;
                    option.value = item.id.toString();
                    if (this.categoryInput) {
                        this.categoryInput.appendChild(option);
                    }
                }
            })
        }

        if (this.categoryInput && this.editingOperation) {
            const result: HTMLOptionElement | undefined = Array.from(this.categoryInput.options).find((option: HTMLOptionElement) => option.text === (this.editingOperation as OperationType).category);
            if (result) {
                result.selected = true;
                // this.categoryId = this.categoryInput.value;
            } else {
                console.log('ошибка');
            }
        }
    }

    private updateOperation(): void {
        if (this.btnCreate) {
            this.btnCreate.onclick = async () => {
                if (this.editingOperation && this.amountInput && this.commentInput && this.categoryInput) {
                    const result: DefaultResponseType | OperationType = await CustomHttp.request(config.host + '/operations/' + this.editingOperation.id, 'PUT', {
                        "type": this.operation,
                        "amount": + this.amountInput.value.split('$')[0],
                        "date": this.date,
                        "comment": this.commentInput.value,
                        "category_id": + this.categoryInput.value
                    });
                    if (result) {
                        if ((result as DefaultResponseType).error) {
                            throw new Error((result as DefaultResponseType).message);
                        }
                    }
                }
                location.href = '#/incomeAndCharges';
            }
        }
    }

    private cancelCreation(): void {
        if (this.btnCancel && this.url) {
            Common.move(this.btnCancel, this.url);
        }
    }
}

