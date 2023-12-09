import {Common} from "../utils/common";
import {Chart, ChartConfiguration} from "chart.js/auto";
import {OperationType} from "../types/operation.type";
import {CurrentOperationsType} from "../types/current-operations.type";

export class MainIncome {
    private dates: HTMLCollectionOf<Element> | null = document.getElementsByClassName('date');
    private result: OperationType[] | null | undefined;
    private currentIncomeOperations: CurrentOperationsType[] | null;
    private currentChargesOperations: CurrentOperationsType[] | null;
    private currentIncomeCategories: string[] | null;
    private currentChargesCategories: string[] | null;
    private currentIncomeAmounts: number[] | null;
    private currentChargesAmounts: number[] | null;
    readonly incomeChartElement: HTMLCanvasElement | null;
    readonly chargesChartElement: HTMLCanvasElement | null;
    private chartIncome: Chart | null = null;
    private cartCharges: Chart | null = null;


    constructor() {
        this.dates = document.getElementsByClassName('date') as HTMLCollectionOf<HTMLInputElement>;
        this.result = null;

        this.currentIncomeOperations = [];
        this.currentChargesOperations = [];

        this.currentIncomeCategories = [];
        this.currentChargesCategories = [];

        this.currentIncomeAmounts = [];
        this.currentChargesAmounts = [];

        this.incomeChartElement = document.getElementById('incomeChart') as HTMLCanvasElement;
        this.chargesChartElement = document.getElementById('chargesChart') as HTMLCanvasElement;

        this.init();
    }


    protected async init(): Promise<void> {
        await this.filterOperations('Неделя');
        if (this.currentIncomeCategories && this.currentIncomeAmounts && this.currentChargesCategories && this.currentChargesAmounts) {
            this.makePies(this.currentIncomeCategories, this.currentIncomeAmounts, this.currentChargesCategories, this.currentChargesAmounts);
        }

        const buttons: HTMLCollectionOf<HTMLElement> | null = document.getElementsByClassName('chosenPeriod') as HTMLCollectionOf<HTMLElement>;
        const buttonsElements: HTMLElement[] = Array.from(buttons);

        buttonsElements.forEach((btn: HTMLElement) => {
            btn.onclick = async e => {
                buttonsElements.forEach((item: HTMLElement) => item.classList.remove('active'));
                (e.target as HTMLElement).classList.add('active');

                Common.changeDateInput('#/main');

                if ((e.target as HTMLElement).innerText !== "Интервал" && this.dates) {
                    Array.from(this.dates).forEach(date => {
                        (date as HTMLInputElement).value = '';
                        (date as HTMLInputElement).style.width = '39px';
                    });
                }
                await this.filterOperations((e.target as HTMLElement).innerText);

                const diagramIncome: HTMLElement | null = document.getElementById("diagram-income");
                if (diagramIncome && this.incomeChartElement) {
                    diagramIncome.removeChild(this.incomeChartElement);
                }
                const incomeCanvas: HTMLElement | null = document.createElement('canvas');
                if (incomeCanvas && diagramIncome) {
                    incomeCanvas.setAttribute('id', 'incomeChart');
                    diagramIncome.appendChild(incomeCanvas);
                }

                const diagramCharges: HTMLElement | null = document.getElementById("diagram-charges");
                if (diagramCharges && this.chargesChartElement) {
                    diagramCharges.removeChild(this.chargesChartElement);
                }
                const chargesCanvas: HTMLElement | null = document.createElement('canvas');
                if (chargesCanvas && diagramCharges) {
                    chargesCanvas.setAttribute('id', 'chargesChart');
                    diagramCharges.appendChild(chargesCanvas);
                }

                if (this.currentIncomeCategories && this.currentIncomeAmounts && this.currentChargesCategories && this.currentChargesAmounts) {
                    this.makePies(this.currentIncomeCategories, this.currentIncomeAmounts, this.currentChargesCategories, this.currentChargesAmounts);
                }
            }
        });
    }

    private async filterOperations(period: string): Promise<void> {
        this.result = await Common.getOperations(period);

        this.currentIncomeCategories = [];
        this.currentIncomeAmounts = [];
        this.currentChargesCategories = [];
        this.currentChargesAmounts = [];
        this.currentChargesOperations = [];
        this.currentIncomeOperations = [];

        if (!this.result) return;

        this.result.forEach((item: OperationType) => {
            if (item.type === 'income' && this.currentIncomeOperations) {
                const existingCategory: CurrentOperationsType | undefined = this.currentIncomeOperations.find((operation: CurrentOperationsType) => item.category === operation.category);

                if (existingCategory) {
                    existingCategory.amount += item.amount;
                } else {
                    this.currentIncomeOperations.push({
                        category: item.category,
                        amount: item.amount
                    });
                }

            } else if (item.type === 'expense' && this.currentChargesOperations) {
                const existingCategory: CurrentOperationsType | undefined = this.currentChargesOperations.find((operation: CurrentOperationsType) => item.category === operation.category);

                if (existingCategory) {
                    existingCategory.amount += item.amount;
                } else {
                    this.currentChargesOperations.push({
                        category: item.category,
                        amount: item.amount
                    });
                }
            }
        })

        this.currentIncomeOperations.forEach((item: CurrentOperationsType)  => {
            if (this.currentIncomeCategories && this.currentIncomeAmounts) {
                this.currentIncomeCategories.push(item.category);
                this.currentIncomeAmounts.push(item.amount);
            }
        })

        this.currentChargesOperations.forEach(item => {
            if (this.currentChargesCategories && this.currentChargesAmounts) {
                this.currentChargesCategories.push(item.category);
                this.currentChargesAmounts.push(item.amount);
            }
        })
    }

    private makePies(incomeCategories: string[], incomeAmounts: number[], chargesCategories: string[], chargesAmounts: number[]): void {

        var ctxP: CanvasRenderingContext2D | null = (document.getElementById("incomeChart") as HTMLCanvasElement).getContext('2d');
        if (!ctxP) return;
        this.chartIncome = new Chart(ctxP, <ChartConfiguration> {
            type: 'pie',
            data: {
                labels: incomeCategories,
                datasets: [{
                    data: incomeAmounts,
                    backgroundColor: ["#DC3545", "#FD7E14", "#FFC107", "#20C997", "#0D6EFD"],
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'start',
                        labels: {
                            boxWidth: 35,
                            boxHeight: 10,
                            padding: 10,
                            color: '#000000',
                            font: 'Roboto-Medium'
                        },
                        title: {
                            padding: 10,
                            color: '#000000',
                            font: 'Roboto-Medium'
                        }
                    }
                },
                responsive: true,
                rotation: -45,
                aspectRatio: 1 | 1,
                animation: {
                    animateRotate: false
                }
            },
        });

        var ctxP2: CanvasRenderingContext2D | null = (document.getElementById("chargesChart") as HTMLCanvasElement).getContext('2d');
        if (!ctxP2) return;
        this.cartCharges = new Chart(ctxP2, <ChartConfiguration> {
            type: 'pie',
            data: {
                labels: chargesCategories,
                datasets: [{
                    data: chargesAmounts,
                    backgroundColor: ["#DC3545", "#FD7E14", "#FFC107", "#20C997", "#0D6EFD"]
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'start',
                        labels: {
                            boxWidth: 35,
                            boxHeight: 10,
                            padding: 10,
                            font: {
                                family: 'Roboto-Medium',
                                color: '#000000'
                            }
                        },
                        paddingBottom: 40
                    }
                },
                responsive: true,
                rotation: 190,
                aspectRatio: 1 | 1,
                animation: {
                    animateRotate: false
                }
            },

        });
    }
}
