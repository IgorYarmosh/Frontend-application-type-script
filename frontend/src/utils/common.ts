import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {OperationType} from "../types/operation.type";
import {DefaultResponseType} from "../types/default-response.type";

export class Common {

    private static modal: HTMLElement | null;

    public static changeDateInput(page: string = ''): void {
        const dateInputs: HTMLCollection | null = document.getElementsByClassName('date');
        const dateInputsArray: HTMLInputElement[] = Array.from(dateInputs) as HTMLInputElement[];

        if (dateInputs) {
            dateInputsArray.forEach((date: HTMLInputElement) => {
                date.onfocus = (e: FocusEvent) => {
                    (e.target as HTMLInputElement).type = 'date';
                    if (page === '#/main' || page === '#/incomeAndCharges') {
                        (e.target as HTMLElement).style.width = '90px';
                    }
                }

                date.onblur = e => {
                    (e.target as HTMLInputElement).type = 'text';
                }

                date.onchange = e => {
                    const dates: string[] = (e.target as HTMLInputElement).value.split('-');
                    const reversedDate: string[] = dates.reverse();
                    (date as HTMLInputElement).value = reversedDate.join('.');
                }
            })
        }

    }

    public static move(element: HTMLElement, url: string): void {
        element.onclick = () => {
            location.href = url;
        }
    }


    public static async getOperations(period: string): Promise<OperationType[] | null | undefined> {
        let result: OperationType[] | null = null;
        const dateFromInput: HTMLInputElement | null = document.getElementsByClassName('date')[0] as HTMLInputElement;
        const dateToInput: HTMLInputElement | null = document.getElementsByClassName('date')[1] as HTMLInputElement;
        const that = this;

        switch (period) {
            case "Сегодня":
                result = await CustomHttp.request(config.host + '/operations');
                return result;
            case "Неделя":
                result = await CustomHttp.request(config.host + '/operations?period=week');
                return result;
            case "Месяц":
                result = await CustomHttp.request(config.host + '/operations?period=month');
                return result;
            case "Год":
                result = await CustomHttp.request(config.host + '/operations?period=year');
                return result;
            case "Все":
                result = await CustomHttp.request(config.host + '/operations?period=all');
                return result;
            case "Интервал":
                let dateFrom: string | null = null;
                let dateTo: string | null = null;

                if (dateFromInput) {
                    dateFromInput.onchange = e => {
                        dateFrom = (e.target as HTMLInputElement).value;
                    }
                }

                if (dateToInput) {
                    dateToInput.onchange = e => {
                        dateTo = (e.target as HTMLInputElement).value;
                    }
                }
        }
    }


    public static async deleteCategory(params: string): Promise<void> {
        const confirmBtn: HTMLElement | null = document.getElementById('confirm');
        let allOperations: OperationType[] | null = null;
        this.modal = document.getElementById('modal');
        let element: ParentNode | null | undefined;
        let deletedCategory: string | null = null;

        try {
            allOperations = await CustomHttp.request(config.host + '/operations?period=all');
            // if (allOperations as OperationType[]) {
            //     if ((allOperations as DefaultResponseType).error) {
            //         throw new Error((allOperations as DefaultResponseType).message);
            //     }
            // }
        } catch (error) {
            return console.log(error);
        }

        if (this.modal) {
            this.modal.addEventListener('show.bs.modal', e => {
                const button: HTMLElement | null = (e as MouseEvent).relatedTarget as HTMLElement;

                if (button) {
                    element = button.parentNode?.parentNode;
                    deletedCategory = button.getAttribute('category-name');
                }

                if (confirmBtn && button) {
                        confirmBtn.onclick = async () => {
                            if (element) {
                                element.parentNode?.removeChild(element);
                            }
                            try {
                                const result: DefaultResponseType = await CustomHttp.request(config.host + params + button.getAttribute('data-id'), 'DELETE');
                                if (result) {
                                    if ((result as DefaultResponseType).error) {
                                        throw new Error((result as DefaultResponseType).message);
                                    }
                                    console.log("Категория успешно удалена");
                                }
                            } catch (error) {
                                return console.log(error);
                            }
                        }
                    }

                if (allOperations) {
                    allOperations.forEach((operation: OperationType) => {
                        if (operation.category === deletedCategory) {
                            Common.deleteOperation(operation.id);
                        }
                    })
                }
            })
        }
    }
    public static async deleteOperation(idOperation: number): Promise<void> {
        try {
            const result: DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + idOperation, 'DELETE');
            if (result) {
                if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                }
            }
        } catch (error) {
            return console.log(error);
        }
    }
}