import {CustomHttp} from "../services/custom-http";
import {Auth} from "../services/auth";
import config from "../../config/config";

//import * as bootstrap from 'bootstrap'
import {FormFieldsType} from "../types/FormFields.type";
import {SignupType} from "../types/signup.type";
import {LoginType} from "../types/login.type";

export class Form {
    private processElement: HTMLElement | null;
    readonly agreeElement: HTMLElement | null;
    readonly page: 'signup' | 'login';
    private fields: FormFieldsType[] = [];

    constructor(page: 'signup' | 'login') {
        this.processElement = null;
        this.agreeElement = null;
        this.page = page;
        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false,
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*[0-9])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false,
            }
        ];

        if (this.page === 'signup') {
            this.fields.unshift({
                    name: 'name',
                    id: 'name',
                    element: null,
                    regex: /(^[А-Я][а-я]+\s+)([А-Я][а-я]+\s+)[А-Я][а-я]+\s*$/,
                    valid: false,
                },
                {
                    name: 'repeatPassword',
                    id: 'repeatPassword',
                    element: null,
                    regex: /^(?=.*[0-9])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                    valid: false,
                });
        }

        const that: Form = this;
        this.fields.forEach((item: any) => {
            item.element = document.getElementById(item.id) as HTMLInputElement;
            if (item.element) {
                item.element.onchange = function () {
                    that.validateField.call(that, item, <HTMLInputElement>this);
                }
            }
        });

        this.processElement = document.getElementById('process');
        if (this.processElement) {
            this.processElement.onclick = () => that.processForm()
        }


        if (this.page === 'login') {
            this.agreeElement = document.getElementById('agree');
            if (this.agreeElement) {
                this.agreeElement.onchange = () => that.validateForm()
            }
        }
    }
    private validateField(field: FormFieldsType, element: HTMLInputElement): void {
        const that: Form = this;
        if (!element.value || !element.value.match(field.regex)) {
            element.classList.add('incorrect');
            field.valid = false;
        } else {
            element.classList.remove('incorrect');
            field.valid = true;
        }

        if (this.page === 'signup') {
            if (field.id === 'repeatPassword' && !Form.validatePasswords()) {
                element.classList.add('incorrect');
                field.valid = false;
            }
        }

        this.validateForm();
    }

    private validateForm(): boolean {
        const validForm: boolean = this.fields.every(item => item.valid);

        const isValid: boolean = this.agreeElement ? (this.agreeElement as HTMLInputElement).checked && validForm : validForm && Form.validatePasswords();

        if (this.processElement) {
            if (isValid) {
                this.processElement.classList.remove('disabled');
            } else {
                this.processElement.classList.add('disabled');
            }
        }

        return isValid;
    }


    private static validatePasswords(): boolean {
        const password: HTMLInputElement | null = document.getElementById('password') as HTMLInputElement;
        const repeatPassword: HTMLInputElement | null = document.getElementById('repeatPassword') as HTMLInputElement;
        if (repeatPassword && password) {
            if (repeatPassword.value && password.value) {
                return repeatPassword.value === password.value;
            }
        }
        return false;
    }


    private async processForm(): Promise<void> {

        if (this.validateForm()) {
            const email: string | undefined = this.fields.find(item => item.name === 'email')?.element?.value;
            const password: string | undefined = this.fields.find(item => item.name === 'password')?.element?.value;

            if (this.page === 'signup') {
                const fullName: string | null = (document.getElementById('name') as HTMLInputElement).value;
                const [lastName, name]: string[] = fullName.split(' ');
                try {
                    const result: SignupType = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: name,
                        lastName: lastName,
                        email: email,
                        password: password,
                        passwordRepeat: this.fields.find(item => item.name === 'repeatPassword')?.element?.value,
                    });

                    if (result) {
                        if (!result.user) {
                            throw new Error(result.message);
                        }
                    }
                } catch (error) {
                    return console.log(error);
                }
            }

            try {
                const result: LoginType = await CustomHttp.request(config.host + '/login', 'POST', {
                    email: email,
                    password: password,
                })

                if (result) {
                    if (!result.tokens || !result.user) {
                        throw new Error('error');
                    }

                    Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                    Auth.setUserInfo({
                        fullName: result.user.name,
                        userId: result.user.id,
                    })
                    if (email) {
                        localStorage.setItem("userEmail", email);
                    }

                    location.href = '#/main';
                } else {
                    location.href = '#/signup';
                }

            } catch (error) {
                console.log(error);
            }
        }
    }
}

