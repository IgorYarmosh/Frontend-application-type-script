import {Common} from "../../utils/common";
import {CustomHttp} from "../../services/custom-http";
import config from "../../../config/config";
import {CategoriesIncomeType} from "../../types/categories-income.type";
import {CategoriesExpenseType} from "../../types/categories-expense.type";
import {OperationResponseType} from "../../types/operation-response.type";
import {DefaultResponseType} from "../../types/default-response.type";

export class CreateIncomeAndCharges {

    readonly btnCancel: HTMLElement | null;
    readonly btnCreate: HTMLElement | null;
    readonly url: string | null;
    private incomeCategories: CategoriesIncomeType[] | null;
    private chargesCategories: CategoriesIncomeType[] | null;
    private operation: string | null;
    private date: string | null;
    readonly commentInput: HTMLInputElement | null;
    readonly selectCategory: HTMLSelectElement | null;
    readonly selectType: HTMLSelectElement | null;
    readonly amountInput: HTMLInputElement | null;
    readonly dateInput: HTMLInputElement | null;
    private fields: CategoriesExpenseType[] = [];



    constructor() {
        this.btnCancel = document.getElementById('cancel');
        this.btnCreate = document.getElementById('create');
        this.url = '#/incomeAndCharges';
        this.incomeCategories = null;
        this.chargesCategories = null;
        this.operation = null;
        this.date = null;
        this.commentInput = document.getElementById('commentInput') as HTMLInputElement;
        this.selectCategory = document.getElementById('selectCategory') as HTMLSelectElement;
        this.selectType = document.getElementById('selectType') as HTMLSelectElement;
        this.amountInput = document.getElementById('amountInput') as HTMLInputElement;
        this.dateInput = document.getElementById('dateInput') as HTMLInputElement;
        this.fields = [
            {
                id: 'selectType',
                type: 'select',
                element: null,
                valid: false
            },
            {
                id: 'selectCategory',
                type: 'select',
                element: null,
                valid: false
            },
            {
                id: 'amountInput',
                type: 'input',
                element: null,
                valid: false
            },
            {
                id: 'dateInput',
                type: 'input',
                element: null,
                valid: false
            },
            {
                id: 'commentInput',
                type: 'input',
                element: null,
                valid: false
            }
        ];

        const that: CreateIncomeAndCharges = this;
        this.fields.forEach((item: CategoriesExpenseType) => {
            item.element = document.getElementById(item.id.toString()) as HTMLInputElement;

            if (item.element) {
                item.element.addEventListener('change', function () {
                    that.validateField.call(that, item, <HTMLInputElement>this);
                })
            }
        });

        Common.changeDateInput();
        this.process();
        this.cancelCreation();
    }

    private validateField(field: CategoriesExpenseType, element: HTMLInputElement | HTMLSelectElement): void {
        if (!element.value) {
            field.valid = false;
        } else {
            field.valid = true;
        }

        this.validateForm();
    }

    private validateForm(): void {
        this.fields[0].valid = true;
        const isValid: boolean = this.fields.every(item => item.valid);

        if (this.btnCreate) {
            if (isValid) {
                this.btnCreate.removeAttribute('disabled');
            } else {
                this.btnCreate.setAttribute('disabled', 'disabled');
            }
        }
    }

    private async process(): Promise<void> {
        if (!this.selectType) return;

        if (localStorage.getItem('operation') === 'доход') {
            this.selectType.options[1].selected = true;
            this.operation = 'income';

        } else if (localStorage.getItem('operation') === 'расход') {
            this.selectType.options[2].selected = true;
            this.operation = "expense";
        }

        this.selectType.onchange = e => {
            if ((e.target as HTMLSelectElement).value === 'доход') {
                this.operation = 'income';
            } else if ((e.target as HTMLSelectElement).value === 'расход') {
                this.operation = "expense";
            }

            if (this.selectCategory) {
                if (this.selectCategory.options) {
                    Array.from(this.selectCategory.options).forEach((item: HTMLOptionElement) => (this.selectCategory as HTMLSelectElement).removeChild(item))
                }
            }

            if (this.operation === "income" && this.incomeCategories || this.operation === "expense" && this.chargesCategories) {
                this.getCategories();
            } else {
                console.log('error');
            }
        }

        this.incomeCategories = await CustomHttp.request(config.host + '/categories/income');
        this.chargesCategories = await CustomHttp.request(config.host + '/categories/expense');

        if (this.operation === "income" && this.incomeCategories || this.operation === "expense" && this.chargesCategories) {
            await this.getCategories();
        } else {
            console.log('error');
        }
    }

    private async getCategories(): Promise<void> {
        if (!this.incomeCategories || !this.chargesCategories) return;

        if (this.operation === "income") {
            this.incomeCategories.forEach((item: CategoriesIncomeType) => {
                const option: HTMLOptionElement | null = document.createElement('option');
                option.text = item.title;
                option.value = item.id.toString();
                if (this.selectCategory) {
                    this.selectCategory.appendChild(option);
                }
            })
        } else if (this.operation === "expense") {
            this.chargesCategories.forEach((item: CategoriesIncomeType) => {
                const option: HTMLOptionElement | null = document.createElement('option');
                option.text = item.title;
                option.value = item.id.toString();
                if (this.selectCategory) {
                    this.selectCategory.appendChild(option);
                }
            })
        }

        this.createOperation();

        if (this.amountInput) {
            this.amountInput.onclick = () => {
                (this.amountInput as HTMLInputElement).type = 'number';
            }
        }

        if (this.amountInput) {
            this.amountInput.onblur = () => {
                (this.amountInput as HTMLInputElement).type = 'text';
                (this.amountInput as HTMLInputElement).value = (this.amountInput as HTMLInputElement).value + '$';
            }
        }
    }

    private createOperation(): void {
        if (this.dateInput) {
            this.dateInput.onchange = e => {
                (this.dateInput as HTMLInputElement).type = 'date';

                let date: string[] = (e.target as HTMLInputElement).value.split('-');
                let modifiedDate: string[] = date.reverse();

                this.date = (e.target as HTMLInputElement).value;
                (this.dateInput as HTMLInputElement).type = 'text';
                (this.dateInput as HTMLInputElement).value = modifiedDate.join('.');
            }
        }

        if (this.btnCreate) {
            this.btnCreate.onclick = async () => {

                if (this.amountInput && this.commentInput && this.selectCategory) {
                    const result: OperationResponseType | DefaultResponseType = await CustomHttp.request(config.host + '/operations', 'POST', {
                        "type": this.operation,
                        "amount": this.amountInput.value,
                        "date": this.date,
                        "comment": this.commentInput.value,
                        "category_id": +this.selectCategory.value
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
