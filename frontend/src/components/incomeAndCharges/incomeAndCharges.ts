import {Common} from "../../utils/common";
import {CustomHttp} from "../../services/custom-http";
import config from "../../../config/config";
import {OperationType} from "../../types/operation.type";
import {DefaultResponseType} from "../../types/default-response.type";

export class IncomeAndCharges {
    readonly buttons: HTMLCollectionOf<HTMLElement> | null;
    readonly dates: HTMLCollectionOf<HTMLInputElement> | null;
    private result: OperationType[] | null | undefined;
    private dateFrom: string | null;
    private dateTo: string | null;
    readonly tbodyElement: HTMLElement | null;
    private operationId: string | null;


    constructor() {
        this.buttons = document.getElementsByClassName('chosenPeriod') as HTMLCollectionOf<HTMLElement>;
        this.dates = document.getElementsByClassName('date') as HTMLCollectionOf<HTMLInputElement>;
        this.result = null;
        this.dateFrom = null;
        this.dateTo = null;
        this.tbodyElement = document.getElementById('tbody');
        this.operationId = null;
        this.init();
    }

    private init(): void {
        this.filterOperations('Сегодня');

        if (!this.buttons) return;

        const buttons: HTMLElement[] = Array.from(this.buttons) as HTMLElement[];
        buttons.forEach(btn => {
            btn.onclick = e => {
                if (this.tbodyElement) {
                    this.tbodyElement.innerHTML = '';
                }

                buttons.forEach(item => item.classList.remove('active'));
                (e.target as HTMLElement).classList.add('active');

                Common.changeDateInput('#/incomeAndCharges');

                if ((e.target as HTMLElement).innerText !== "Интервал" && this.dates) {
                    Array.from(this.dates).forEach((date: HTMLInputElement) => {
                        date.value = '';
                        date.style.width = '39px';
                    })
                }
                this.filterOperations((e.target as HTMLInputElement).innerText);
            }
        });
        this.deleteOperation();
        this.createOperation();
    }

    private async filterOperations(period: string): Promise<void> {
       this.result = await Common.getOperations(period);

        if (this.result) {
            this.showCategoriesTable(this.result);
        } else {
            console.log('error');
        }
    }

    private showCategoriesTable(result: OperationType[]): void {
        result.forEach((item: OperationType, index: number) => {
            const rowCategoryElement: HTMLElement | null = document.createElement('tr');
            if (rowCategoryElement) {
                rowCategoryElement.className = 'rowOperation';
            }

            const numberElement: HTMLElement | null = document.createElement('td');
            if (numberElement) {
                numberElement.className = 'number';
                numberElement.innerText = (index + 1).toString();
            }

            const operationElement: HTMLElement | null = document.createElement('td');
            if (operationElement) {
                if (item.type === 'income') {
                    operationElement.className = 'text-success';
                    operationElement.innerText = 'доход';
                } else {
                    operationElement.className = 'text-danger';
                    operationElement.innerText = 'расход';
                }
            }

            const categoryElement: HTMLElement | null = document.createElement('td');
            if (categoryElement) {
                categoryElement.innerText = item.category;
            }

            const amountElement: HTMLElement | null = document.createElement('td');
            if (amountElement) {
                amountElement.innerText = item.amount + "$";
            }

            const dateElement: HTMLElement | null = document.createElement('td');
            let date: string[] = item.date.split('-');
            let modifiedDate: string[] = date.reverse();
            if (dateElement) {
                dateElement.innerText = modifiedDate.join('.');
            }

            const commentElement: HTMLElement | null = document.createElement('td');
            if (commentElement) {
                commentElement.innerText = item.comment;
            }

            const linksElements: HTMLElement | null = document.createElement('td');
            const deleteElement: HTMLElement | null = document.createElement('a');
            if (deleteElement) {
                deleteElement.className = 'deleteOperation';
                deleteElement.setAttribute('href', "javascript:void(0)");
                deleteElement.setAttribute('data-bs-toggle', 'modal');
                deleteElement.setAttribute('data-bs-target', '#modal');
                deleteElement.setAttribute('data-id', item.id.toString());
            }

            const deleteImage: HTMLElement | null = document.createElement('img');
            if (deleteImage) {
                deleteImage.setAttribute('src', "/images/delete.png");
                deleteImage.setAttribute('alt', "delete");
            }

            const editElement: HTMLElement | null = document.createElement('a');
            if (editElement) {
                editElement.className = 'editOperation';
                editElement.setAttribute('href', "#/editIncomeAndCharges");
                editElement.setAttribute('data-id', item.id.toString());
            }

            const editImage: HTMLElement | null = document.createElement('img');
            if (editImage) {
                editImage.setAttribute('src', "/images/edit.png");
                editImage.setAttribute('alt', "edit");
            }

            deleteElement.appendChild(deleteImage);
            editElement.appendChild(editImage);

            if (linksElements) {
                linksElements.appendChild(deleteElement);
                linksElements.appendChild(editElement);
            }

            rowCategoryElement.appendChild(numberElement);
            rowCategoryElement.appendChild(operationElement);
            rowCategoryElement.appendChild(categoryElement);
            rowCategoryElement.appendChild(amountElement);
            rowCategoryElement.appendChild(dateElement);
            rowCategoryElement.appendChild(commentElement);
            rowCategoryElement.appendChild(linksElements);

            if (this.tbodyElement) {
                this.tbodyElement.appendChild(rowCategoryElement);
            }
        })

        this.editOperation();
    }

    private editOperation(): void {
        const editButton: HTMLCollectionOf<HTMLElement> = document.getElementsByClassName('editOperation') as HTMLCollectionOf<HTMLElement>;

        if (editButton) {
            Array.from(editButton).forEach((button: HTMLElement) => {
                button.onclick = e => {
                    this.operationId = ((e.target as HTMLElement).parentNode as HTMLElement).getAttribute('data-id');

                    if (this.result && this.operationId) {
                        const operation: OperationType | undefined | null = this.result.find((operation: OperationType) => operation.id === +(<string>this.operationId));
                        localStorage.setItem('editingOperation', JSON.stringify(operation));
                    }
                }
            })
        }
    }

    private deleteOperation(): void {
        const modal: HTMLElement | null = document.getElementById('modal');
        const confirmBtn: HTMLElement | null = document.getElementById('confirm');

        if (!modal) return;

        modal.addEventListener('show.bs.modal', e => {
            const button: HTMLElement | null = (e as MouseEvent).relatedTarget as HTMLElement;
            const element: ParentNode | null | undefined = button.parentNode?.parentNode?.parentNode;
            if (confirmBtn) {
                confirmBtn.onclick = async () => {
                    if (element) {
                        (element.parentNode)?.removeChild(element);
                    }
                    try {
                        const result: DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + button.getAttribute('data-id'), 'DELETE');
                        if (result) {
                            if (result.error) {
                                throw new Error(result.message);
                            }
                            console.log("Операция успешно удалена");
                            location.href = '#/incomeAndCharges';
                        }
                    } catch (error) {
                        return console.log(error);
                    }
                }
            }
        })
    }


    private createOperation(): void {
        const createOperation: HTMLCollection | null = document.getElementsByClassName('createOperation');
        const createOperationElements: HTMLElement[] = Array.from(createOperation) as HTMLElement[];

        if (createOperationElements) {
            createOperationElements.forEach((create: HTMLElement) => {
                create.onclick = e => {
                    if ((e.target as HTMLElement).innerText === 'Создать доход') {
                        localStorage.setItem('operation', 'доход');
                    } else if ((e.target as HTMLElement).innerText === 'Создать расход') {
                        localStorage.setItem('operation', 'расход');
                    }
                    location.href = '#/createIncomeAndCharges';
                }
            })
        }
    }
}
