export type SignupType = {
    error?: boolean,
    message?: string,
    user?: {id: number, email: string, name: string, lastName: string},
}